import { handleErrorToOperationResult } from '@/core/error-handling/handle-error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/types'
import { SapItemRepository } from '@/domain/shared/repositories/sap/sap-item.repository'
import { SapPriceListRepository } from '@/domain/shared/repositories/sap/sap-price-list.repository'
import { SalesforcePricebookEntryRepository } from '@/domain/shared/repositories/sf/sf-pricebook-entry.repository'
import { SapItem } from '@/domain/shared/schemas/sap-item.schema'
import { SfPricebookEntry } from '@/domain/shared/schemas/sf-pricebook-entry.schema'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import SalesforceProductService from './sf-products.service'

export default class SalesforcePricebookEntryService {
  private readonly sapItemRepo = new SapItemRepository()
  private readonly sfPricebookEntryRepository = new SalesforcePricebookEntryRepository()
  private readonly sapPriceListRepo = new SapPriceListRepository()
  private readonly sfProductService = new SalesforceProductService()

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    conSalesforceIdPeroNoExiste: 0,
    salesforceActualizadoEnSAP: 0,
    tiempoInicio: Date.now(),
  }

  async pushSinglePricebookEntry(itemCode: string, item: typeof SapItem.Type = {}): Promise<OperationResult> {
    if (!item.ItemCode) {
      item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
    }

    let result: OperationResult | any
    const draft: typeof SfPricebookEntry.Draft = {}

    //const standardPriceEntry = await this.sfPricebookEntryRepository.findByIdOrNull(item.ItemCode!)

    if (!item.U_SEI_SFID) {
      const res = await this.sfProductService.createOrUpdateProductByItemCode(itemCode)
      if (res.success === false) {
        return res
      }
      item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
    }

    try {
      if (item.ItemPrices?.length) {
        for (const itemPriceList of item.ItemPrices) {
          if (itemPriceList.Price === 0) {
            logger.warn('Saltamos creacion de PriceBookEntry porque el el precio es 0', itemPriceList)
            continue
          }

          draft.Product2Id = item.U_SEI_SFID
          const priceList = await requireEntity(this.sapPriceListRepo.findByIdOrNull(itemPriceList.PriceList))
          draft.Pricebook2Id = priceList.U_SEI_SFID!

          draft.UnitPrice = itemPriceList.Price
          draft.IsActive = true // TODO: De donde sale

          const validated = SfPricebookEntry.validateDraft(draft)

          const exists = await this.sfPricebookEntryRepository.findByCompositeOrNull(item.U_SEI_SFID!, priceList.U_SEI_SFID!)
          item.U_SEI_SFINT_ORI = 'SAP'

          if (exists) {
            await this.sfPricebookEntryRepository.update(exists.Id!, validated)
            result = OperationResultBuilder.success(exists).build()
            this.stats.actualizadas++
          } else {
            const created = await this.sfPricebookEntryRepository.create(validated)
            result = OperationResultBuilder.success(created).build()
            this.stats.creadas++
          }
        }
      }
    } catch (error) {
      result = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar item', result)
    }

    return result
  }

  async createOrUpdatePricebooksEntryBatch(): Promise<OperationResult> {
    let result: any

    try {
      const processResult: OperationResult[] = []

      logger.info('Inicio proceso batch de Price Lists → Salesforce (PricebooksEntry)')

      await this.sapItemRepo.processAllItems(async (items: (typeof SapItem.Type)[]) => {
        for (const item of items) {
          this.stats.total++

          const result = await this.pushSinglePricebookEntry(item.ItemCode!, item)
          processResult.push(result)

          logger.info(`priceListEntry procesados hasta ahora: ${processResult.length}`)

          delay(100)
        }
      })

      result = OperationResultBuilder.success<OperationResult[]>(processResult).build()

      logger.metrics('Estadísticas de sincronización', this.stats)

      return result
    } catch (error) {
      result = handleErrorToOperationResult(error)
    } finally {
      return result
    }
  }
}
