import { logger } from '@/core/logger'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { ServiceLayerEntity } from '@/shared/sap-b1/service-layer/enums/entities'
import { SapItem } from '../../schemas/sap-item.schema'

export class SapItemRepository {
  private readonly sl = ServiceLayer.getInstance()

  async processAllItems(processFn: (batch: (typeof SapItem.Type)[]) => Promise<void>): Promise<void> {
    await this.sl.getAllPaginated<typeof SapItem.Type>(ServiceLayerEntity.Items, processFn, 100, `?$filter=SalesItem eq 'tYES' and ItemsGroupCode eq 122`)
  }

  async findBySfIdOrNull(sfid: string): Promise<typeof SapItem.Type | null> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Buscando Item por SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.Items, query })

    const res = await this.sl.get(ServiceLayerEntity.Items, query)
    logger.info(`Resultado de búsqueda: ${res.length} registros encontrados`, { responsePreview: res[0] })
    return res[0] ?? null
  }

  async existsBySfId(sfid: string): Promise<boolean> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Verificando existencia de Item con SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.Items, query })

    const res = await this.sl.get(ServiceLayerEntity.Items, query)

    const exists = !!res[0]
    logger.info(`Existencia: ${exists}`, { resultLength: res.length })
    return exists
  }

  async update(itemCode: string, draft: typeof SapItem.Draft): Promise<void> {
    const validated = SapItem.validateDraft(draft)
    logger.info(`Actualizando Item con ItemCode: ${itemCode}`, { entity: ServiceLayerEntity.Items, payload: validated })

    await this.sl.patch(ServiceLayerEntity.Items, itemCode, validated)

    logger.info(`Item actualizado`, { itemCode })
  }

  async findByIdOrNull(itemCode: string): Promise<typeof SapItem.Type | null> {
    logger.info(`Obteniendo Item por ItemCode: ${itemCode}`, { entity: ServiceLayerEntity.Items })

    const result = await this.sl.getById(ServiceLayerEntity.Items, itemCode)

    logger.info(`Resultado de búsqueda por ID`, { found: !!result, result })
    return result ?? null
  }
}
