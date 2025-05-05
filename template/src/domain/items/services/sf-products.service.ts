import { handleErrorToOperationResult } from '@/core/error-handling/handle-error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/types'
import { SapItemRepository } from '@/domain/shared/repositories/sap/sap-item.repository'
import { SalesforceProductRepository } from '@/domain/shared/repositories/sf/sf-product.repository'
import { SapItem } from '@/domain/shared/schemas/sap-item.schema'
import { SfProduct2 } from '@/domain/shared/schemas/sf-product2.schema'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'

export default class SalesforceProductService {
  private readonly sapItemRepo = new SapItemRepository()
  private readonly sfProductRepo = new SalesforceProductRepository()

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    conSalesforceIdPeroNoExiste: 0,
    salesforceActualizadoEnSAP: 0,
    tiempoInicio: Date.now(),
  }

  async pushSingleProduct(itemCode: string, item: typeof SapItem.Type = {}): Promise<OperationResult> {
    if (!item.ItemCode) {
      item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
    }

    let result: OperationResult | any
    const draft: typeof SfProduct2.Draft = {}

    try {
      draft.Name = item.ItemName
      draft.ProductCode = item.ItemCode
      draft.Description = item.ItemDescription
      draft.IsActive = item.Valid === 'tYES'

      const validated = SfProduct2.validateDraft(draft)

      const exists = await this.sfProductRepo.findByItemCodeOrNull(item.ItemCode!)
      item.U_SEI_SFINT_ORI = 'SAP'

      if (exists) {
        await this.sfProductRepo.update(exists.Id!, validated)
        item.U_SEI_SFID = exists.Id
        await this.sapItemRepo.update(item.ItemCode!, item)
        result = OperationResultBuilder.success(exists).build()
        this.stats.actualizadas++
      } else {
        const created = await this.sfProductRepo.create(validated)
        item.U_SEI_SFID = created.Id
        await this.sapItemRepo.update(item.ItemCode!, item)
        const confirmation = await requireEntity(this.sapItemRepo.findByIdOrNull(item.ItemCode!))

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

  async createOrUpdateProductByItemCode(cardCode: string): Promise<OperationResult> {
    const result = await this.pushSingleProduct(cardCode)
    return result
  }

  async createOrUpdateProductsBatch(): Promise<OperationResult> {
    let result: any

    try {
      const processResult: OperationResult[] = []

      logger.info('Inicio proceso batch de items → Salesforce')

      await this.sapItemRepo.processAllItems(async (items: (typeof SapItem.Type)[]) => {
        for (const item of items) {
          this.stats.total++

          const result = await this.pushSingleProduct(item.ItemCode!, item)
          processResult.push(result)

          logger.info(`Items procesados hasta ahora: ${processResult.length}`)

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
