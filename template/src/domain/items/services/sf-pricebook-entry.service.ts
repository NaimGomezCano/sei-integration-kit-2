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
    tiempoInicio: Date.now(),
  }

  async pushSinglePricebookEntry(itemCode: string, item: typeof SapItem.Type = {}): Promise<OperationResult> {
    if (!item.ItemCode) {
      item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
    }

    logger.info('Sincronización PricebookEntry', { itemCode })

    try {
      // Aseguramos que el producto existe en SF
      if (!item.U_SEI_SFID) {
        const prodRes = await this.sfProductService.createOrUpdateProductByItemCode(itemCode)
        if (!prodRes.success) return prodRes
        item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
      }

      const draft: typeof SfPricebookEntry.Draft = {}

      if (!item.ItemPrices?.length) {
        logger.warn('Item sin listas de precios, se omite', { itemCode })
        return OperationResultBuilder.error('ValidationError', 'NO_PRICELISTS', 'El item no contiene precios').build()
      }

      for (const itemPriceList of item.ItemPrices) {
        await delay(500)

        if (itemPriceList.Price === 0) {
          logger.warn('Se omite PricebookEntry con precio 0', {
            itemCode,
            priceList: itemPriceList.PriceList,
          })
          continue
        }

        const priceList = await requireEntity(this.sapPriceListRepo.findByIdOrNull(itemPriceList.PriceList))

        const exists = await this.sfPricebookEntryRepository.findByCompositeOrNull(item.U_SEI_SFID!, priceList.U_SEI_SFID!)

        if (exists) {
          draft.UnitPrice = itemPriceList.Price
          draft.IsActive = true
          const validated = SfPricebookEntry.validateDraft(draft)

          await this.sfPricebookEntryRepository.update(exists.Id!, validated)
          this.stats.actualizadas++
          logger.info('PricebookEntry actualizado', {
            itemCode,
            priceList: priceList.PriceListNo,
            sfId: exists.Id,
          })
        } else {
          draft.Product2Id = item.U_SEI_SFID
          draft.Pricebook2Id = priceList.U_SEI_SFID!
          draft.UnitPrice = itemPriceList.Price
          draft.IsActive = true
          const validated = SfPricebookEntry.validateDraft(draft)

          const created = await this.sfPricebookEntryRepository.create(validated)
          this.stats.creadas++
          logger.info('PricebookEntry creado', {
            itemCode,
            priceList: priceList.PriceListNo,
            sfId: created.Id,
          })
        }
      }

      return OperationResultBuilder.success().build()
    } catch (error) {
      this.stats.errores++
      const opErr = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar PricebookEntry', {
        itemCode,
        error: opErr,
      })
      return opErr
    }
  }

  async createOrUpdatePricebooksEntryBatch(): Promise<OperationResult> {
    try {
      const processResult: OperationResult[] = []
      logger.info('Inicio batch Price Lists → Salesforce (PricebookEntry)')

      await this.sapItemRepo.processAllItems(async (items: (typeof SapItem.Type)[]) => {
        for (const item of items) {
          this.stats.total++
          const res = await this.pushSinglePricebookEntry(item.ItemCode!, item)
          processResult.push(res)

          logger.info('Item procesado', {
            itemCode: item.ItemCode,
            progreso: `${this.stats.total} BPs`,
            creadas: `${this.stats.creadas}`,
            actualizadas: `${this.stats.actualizadas}`,
            errores: `${this.stats.errores}`,
          })

          await delay(100)
        }
      })

      logger.info('Fin batch', {
        duraciónMs: Date.now() - this.stats.tiempoInicio,
        stats: this.stats,
      })

      return OperationResultBuilder.success(processResult).build()
    } catch (error) {
      const opErr = handleErrorToOperationResult(error)
      logger.error('Error en batch PricebookEntry', { error: opErr })
      return opErr
    }
  }
}
