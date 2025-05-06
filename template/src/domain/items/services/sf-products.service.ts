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
    tiempoInicio: Date.now(),
  }

  async pushSingleProduct(itemCode: string, item: typeof SapItem.Type = {}): Promise<OperationResult> {
    if (!item.ItemCode) {
      item = await requireEntity(this.sapItemRepo.findByIdOrNull(itemCode))
    }

    logger.info('Sincronización producto', { itemCode })

    try {
      const draft: typeof SfProduct2.Draft = {
        Name: item.ItemName,
        ProductCode: item.ItemCode,
        Description: item.ItemDescription,
        IsActive: item.Valid === 'tYES',
      }

      const validated = SfProduct2.validateDraft(draft)
      const exists = await this.sfProductRepo.findByItemCodeOrNull(item.ItemCode!)
      item.U_SEI_SFINT_ORI = 'SAP'

      if (exists) {
        await this.sfProductRepo.update(exists.Id!, validated)
        item.U_SEI_SFID = exists.Id
        await this.sapItemRepo.update(item.ItemCode!, item)

        this.stats.actualizadas++
        logger.info('Producto actualizado en SF', { itemCode, sfId: exists.Id })
        return OperationResultBuilder.success(exists).build()
      }

      const created = await this.sfProductRepo.create(validated)
      item.U_SEI_SFID = created.Id
      await this.sapItemRepo.update(item.ItemCode!, item)

      this.stats.creadas++
      logger.info('Producto creado en SF', { itemCode, sfId: created.Id })
      return OperationResultBuilder.success(created).build()
    } catch (error) {
      this.stats.errores++

      const opErr = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar producto', { itemCode, error: opErr })
      return opErr
    }
  }

  async createOrUpdateProductByItemCode(itemCode: string): Promise<OperationResult> {
    return this.pushSingleProduct(itemCode)
  }

  async createOrUpdateProductsBatch(): Promise<OperationResult> {
    try {
      const processResult: OperationResult[] = []
      logger.info('Inicio batch items → Salesforce')

      await this.sapItemRepo.processAllItems(async (items: (typeof SapItem.Type)[]) => {
        for (const item of items) {
          this.stats.total++

          const res = await this.pushSingleProduct(item.ItemCode!, item)
          processResult.push(res)

          logger.info('Item procesado', {
            itemCode: item.ItemCode,
            progreso: `${this.stats.total} items`,
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
      logger.error('Error en batch productos', { error: opErr })
      return opErr
    }
  }
}
