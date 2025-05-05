import { handleErrorToOperationResult } from '@/core/error-handling/handle-error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/types'
import { SapPriceListRepository } from '@/domain/shared/repositories/sap/sap-price-list.repository'
import { SalesforcePricebookRepository } from '@/domain/shared/repositories/sf/sf-pricebook.repository'
import { SapPriceList } from '@/domain/shared/schemas/sap-price-list.schema'
import { SfPricebook } from '@/domain/shared/schemas/sf-pricebook.schema'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'

export default class SalesforcePricebookService {
  private readonly sapPriceListRepo = new SapPriceListRepository()
  private readonly sfPricebookRepository = new SalesforcePricebookRepository()

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    conSalesforceIdPeroNoExiste: 0,
    salesforceActualizadoEnSAP: 0,
    tiempoInicio: Date.now(),
  }

  async pushSinglePricebook(listNo: number, priceList: typeof SapPriceList.Type = {}): Promise<OperationResult> {
    if (!priceList.PriceListNo) {
      priceList = await requireEntity(this.sapPriceListRepo.findByIdOrNull(listNo))
    }

    let result: OperationResult | any
    const draft: typeof SfPricebook.Draft = {}

    try {
      draft.Name = priceList.PriceListName
      draft.IsActive = priceList.Active === 'tYES'
      draft.SAP_Pricebook2_Id__c = priceList.PriceListNo!
      //draft.IsStandard = true // TODO: Por el momento podria no hacer falta 

      const validated = SfPricebook.validateDraft(draft)

      const exists = await this.sfPricebookRepository.findByItemCodeOrNull(priceList.PriceListNo!)
      priceList.U_SEI_SFINT_ORI = 'SAP'

      if (exists) {
        await this.sfPricebookRepository.update(exists.Id!, validated)
        priceList.U_SEI_SFID = exists.Id
        await this.sapPriceListRepo.update(priceList.PriceListNo!, priceList)
        result = OperationResultBuilder.success(exists).build()
        this.stats.actualizadas++
      } else {
        const created = await this.sfPricebookRepository.create(validated)
        priceList.U_SEI_SFID = created.Id
        await this.sapPriceListRepo.update(priceList.PriceListNo!, priceList)
        const confirmation = await requireEntity(this.sapPriceListRepo.findByIdOrNull(priceList.PriceListNo!))

        result = OperationResultBuilder.success(created).build()
        this.stats.creadas++
      }

      draft.IsActive = true
    } catch (error) {
      this.stats.errores++

      result = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar item', result)
    }

    return result
  }

  async createOrUpdatePricebookByNumber(listNo: string): Promise<OperationResult> {
    const result = await this.pushSinglePricebook(Number(listNo))
    return result
  }

  async createOrUpdatePricebooksBatch(): Promise<OperationResult> {
    let result: any

    try {
      const processResult: OperationResult[] = []

      logger.info('Inicio proceso batch de Price Lists → Salesforce (Pricebooks)')

      await this.sapPriceListRepo.processAllPriceLists(async (priceLists: (typeof SapPriceList.Type)[]) => {
        for (const priceList of priceLists) {
          this.stats.total++

          const result = await this.pushSinglePricebook(priceList.PriceListNo!, priceList)
          processResult.push(result)

          logger.info(`priceList procesados hasta ahora: ${processResult.length}`)

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
