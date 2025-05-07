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
  private readonly sfPricebookRepo = new SalesforcePricebookRepository()

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    tiempoInicio: Date.now(),
  }

  async pushSinglePricebook(listNo: number, priceList: typeof SapPriceList.Type = {}): Promise<OperationResult> {
    if (!priceList.PriceListNo) {
      priceList = await requireEntity(this.sapPriceListRepo.findByIdOrNull(listNo))
    }

    logger.info('Sincronización Pricebook', { listNo })

    try {
      const draft: typeof SfPricebook.Draft = {
        Name: priceList.PriceListName,
        IsActive: priceList.Active === 'tYES',
        SAP_Pricebook2_Id__c: priceList.PriceListNo!,
      }

      const validated = SfPricebook.validateDraft(draft)
      const exists = await this.sfPricebookRepo.findByItemCodeOrNull(priceList.PriceListNo!)

      if (exists) {
        await this.sfPricebookRepo.update(exists.Id!, validated)
        priceList.U_SEI_SFID = exists.Id
        await this.sapPriceListRepo.update(priceList.PriceListNo!, priceList)

        this.stats.actualizadas++
        logger.info('Pricebook actualizado', { listNo, sfId: exists.Id })
        return OperationResultBuilder.success(exists).build()
      }

      const created = await this.sfPricebookRepo.create(validated)
      priceList.U_SEI_SFID = created.Id
      await this.sapPriceListRepo.update(priceList.PriceListNo!, priceList)

      this.stats.creadas++
      logger.info('Pricebook creado', { listNo, sfId: created.Id })
      return OperationResultBuilder.success(created).build()
    } catch (error) {
      this.stats.errores++

      const opErr = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar Pricebook', { listNo, error: opErr })
      return opErr
    }
  }

  async createOrUpdatePricebookByNumber(listNo: string): Promise<OperationResult> {
    return this.pushSinglePricebook(Number(listNo))
  }

  async createOrUpdatePricebooksBatch(): Promise<OperationResult> {
    try {
      const processResult: OperationResult[] = []
      logger.info('Inicio batch Price Lists → Salesforce (Pricebooks)')

      await this.sapPriceListRepo.processAllPriceLists(async (priceLists: (typeof SapPriceList.Type)[]) => {
        for (const priceList of priceLists) {
          this.stats.total++

          const res = await this.pushSinglePricebook(priceList.PriceListNo!, priceList)
          processResult.push(res)

          logger.info('Pricebook procesado', {
            listNo: priceList.PriceListNo,
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
      logger.error('Error en batch Pricebooks', { error: opErr })
      return opErr
    }
  }
}
