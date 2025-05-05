import { logger } from '@/core/logger'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { ServiceLayerEntity } from '@/shared/sap-b1/service-layer/enums/entities'
import { SapBusinessPartner } from '../../schemas/sap-business-partner.schema'

export class SapBusinessPartnerRepository {
  private readonly sl = ServiceLayer.getInstance()

  async processAllBusinessPartners(processFn: (batch: (typeof SapBusinessPartner.Type)[]) => Promise<void>): Promise<void> {
    await this.sl.getAllPaginated<typeof SapBusinessPartner.Type>(ServiceLayerEntity.BusinessPartners, processFn, 500, "$filter=CardType eq 'C'")
  }

  async findBySfIdOrNull(sfid: string): Promise<typeof SapBusinessPartner.Type | null> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Buscando BP por SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.BusinessPartners, query })

    const res = await this.sl.get(ServiceLayerEntity.BusinessPartners, query)
    logger.info(`Resultado de búsqueda: ${res.length} registros encontrados`, { responsePreview: res[0] })
    return res[0] ?? null
  }

  async existsBySfId(sfid: string): Promise<boolean> {
    const query = `?$filter=U_SEI_SFID eq '${sfid}'`
    logger.info(`Verificando existencia de BP con SalesforceId: ${sfid}`, { entity: ServiceLayerEntity.BusinessPartners, query })

    const res = await this.sl.get(ServiceLayerEntity.BusinessPartners, query)

    const exists = !!res[0]
    logger.info(`Existencia: ${exists}`, { resultLength: res.length })
    return exists
  }

  async create(draft: typeof SapBusinessPartner.Draft): Promise<typeof SapBusinessPartner.Type> {
    const validated = SapBusinessPartner.validateDraft(draft)
    logger.info(`Creando BP`, { entity: ServiceLayerEntity.BusinessPartners, payload: validated })

    const result: typeof SapBusinessPartner.Type = await this.sl.post(ServiceLayerEntity.BusinessPartners, validated)

    logger.info(`BP creado`, { response: result })

    return result
  }

  async update(cardCode: string, draft: typeof SapBusinessPartner.Draft): Promise<void> {
    const validated = SapBusinessPartner.validateDraft(draft)
    logger.info(`Actualizando BP con CardCode: ${cardCode}`, { entity: ServiceLayerEntity.BusinessPartners, payload: validated })

    await this.sl.patch(ServiceLayerEntity.BusinessPartners, cardCode, validated)

    logger.info(`BP actualizado`, { cardCode })
  }

  async findByIdOrNull(cardCode: string): Promise<typeof SapBusinessPartner.Type | null> {
    logger.info(`Obteniendo BP por CardCode: ${cardCode}`, { entity: ServiceLayerEntity.BusinessPartners })

    const result = await this.sl.getById(ServiceLayerEntity.BusinessPartners, cardCode)

    logger.info(`Resultado de búsqueda por ID`, { found: !!result, result })
    return result ?? null
  }
}
