import { logger } from '@/core/logger'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { ServiceLayerEntity } from '@/shared/sap-b1/service-layer/enums/entities'
import { SapPriceList } from '../../schemas/sap-price-list.schema'

export class SapPriceListRepository {
  private readonly sl = ServiceLayer.getInstance()

  async processAllPriceLists(processFn: (batch: (typeof SapPriceList.Type)[]) => Promise<void>): Promise<void> {
    await this.sl.getAllPaginated<typeof SapPriceList.Type>(ServiceLayerEntity.PriceLists, processFn, 100, ``)
  }

  async findBySfIdOrNull(sfid: string): Promise<typeof SapPriceList.Type | null> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Buscando PriceList por SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.PriceLists, query })

    const res = await this.sl.get(ServiceLayerEntity.PriceLists, query)
    logger.info(`Resultado de búsqueda: ${res.length} registros encontrados`, { responsePreview: res[0] })
    return res[0] ?? null
  }

  async existsBySfId(sfid: string): Promise<boolean> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Verificando existencia de SapPriceList con SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.PriceLists, query })

    const res = await this.sl.get(ServiceLayerEntity.PriceLists, query)

    const exists = !!res[0]
    logger.info(`Existencia: ${exists}`, { resultLength: res.length })
    return exists
  }

  async update(listNo: number, draft: typeof SapPriceList.Draft): Promise<void> {
    const validated = SapPriceList.validateDraft(draft)
    logger.info(`Actualizando SapPriceList con listNo: ${listNo}`, { entity: ServiceLayerEntity.PriceLists, payload: validated })

    await this.sl.patch(ServiceLayerEntity.PriceLists, listNo, validated)

    logger.info(`PriceList actualizado`, { listNo })
  }

  async findByIdOrNull(listNo: number): Promise<typeof SapPriceList.Type | null> {
    logger.info(`Obteniendo PriceList por listNo: ${listNo}`, { entity: ServiceLayerEntity.PriceLists })

    const result = await this.sl.getById(ServiceLayerEntity.PriceLists, listNo)

    logger.info(`Resultado de búsqueda por ID`, { found: !!result, result })
    return result ?? null
  }
}
