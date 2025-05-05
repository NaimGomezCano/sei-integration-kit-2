import { logger } from '@/core/logger'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { ServiceLayerEntity } from '@/shared/sap-b1/service-layer/enums/entities'
import { SapSalesOrder } from '../../schemas/sap-orders.schema'

export class SapOrderRepository {
  private readonly sl = ServiceLayer.getInstance()

  async findBySfIdOrNull(sfid: string): Promise<typeof SapSalesOrder.Type | null> {
    const filter = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info('Buscando orden por SalesforceId', { entity: ServiceLayerEntity.SalesOrders, filter })

    const res: any = await this.sl.get(ServiceLayerEntity.SalesOrders, filter)

    logger.info('Respuesta del Service Layer - findBySfIdOrNull', { result: res })
    return res[0] ?? null
  }

  async existsBySfId(sfid: string): Promise<boolean> {
    const filter = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info('Verificando existencia de orden por SalesforceId', { entity: ServiceLayerEntity.SalesOrders, filter })

    const res = await this.sl.get(ServiceLayerEntity.SalesOrders, filter)

    logger.info('Existencia encontrada:', { exists: !!res[0] })
    return !!res[0]
  }

  async create(draft: typeof SapSalesOrder.Draft): Promise<typeof SapSalesOrder.Type> {
    logger.info('Validando y creando orden en Service Layer', { draft })

    const validated = SapSalesOrder.validateDraft(draft)
    const created: typeof SapSalesOrder.Type = await this.sl.post(ServiceLayerEntity.SalesOrders, validated)

    logger.info('Orden creada exitosamente', { docEntry: created.DocEntry })
    return created
  }

  async update(docEntry: number, draft: typeof SapSalesOrder.Draft): Promise<void> {
    logger.info('Validando y actualizando orden en Service Layer', { docEntry, draft })

    const validated = SapSalesOrder.validateDraft(draft)
    await this.sl.patch(ServiceLayerEntity.SalesOrders, docEntry, validated)

    logger.info('Orden actualizada', { docEntry })
  }

  async getByIdOrNull(docEntry: number): Promise<typeof SapSalesOrder.Type | null> {
    logger.info('Buscando orden por DocEntry', { docEntry })

    const result: any = await this.sl.getById(ServiceLayerEntity.SalesOrders, docEntry)

    logger.info('Respuesta del Service Layer - getByIdOrNull', { result })
    return result ?? null
  }
}
