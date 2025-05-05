import { logger } from '@/core/logger'
import { SalesforceClient } from '@/shared/salesforce/salesforce-api/salesforce-client'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { SfPricebookEntry } from '../../schemas/sf-pricebook-entry.schema'

export class SalesforcePricebookEntryRepository {
  private readonly sf = new SalesforceClient()

  private readonly apiVersion = 'v60.0'

  private get basePath(): string {
    return `/services/data/${this.apiVersion}/sobjects/PricebookEntry`
  }

  async findByIdOrNull(id: string): Promise<typeof SfPricebookEntry.Type | null> {
    logger.info(`Obteniendo SfPricebookEntry por Id: ${id}`)

    try {
      const { data } = await this.sf.get<typeof SfPricebookEntry.Type>(`${this.basePath}/${id}`)
      return data
    } catch (err: any) {
      if (err.response?.status === 404) {
        logger.info('SfPricebookEntry no encontrado', { id })
        return null
      }
      throw err
    }
  }

  async exists(id: string): Promise<boolean> {
    logger.info(`Verificando existencia de SfPricebookEntry con Id: ${id}`)
    try {
      await this.sf.get<void>(`${this.basePath}/${id}`, {
        headers: { 'If-None-Match': '0' }, // evita traer el body completo
      })
      return true
    } catch (err: any) {
      if (err.response?.status === 404) return false
      throw err
    }
  }

  async findByItemCodeOrNull(itemCode: number): Promise<typeof SfPricebookEntry.Type | null> {
    logger.info(`Verificando existencia de SfPricebookEntry con Id: ${itemCode}`)
    const res: any = await this.sf.get<void>(`/services/data/v60.0/query?q=SELECT+Id,Name+FROM+PricebookEntry+WHERE+SAP_Composite_Id__c=${itemCode}`, {
      headers: { 'If-None-Match': '0' },
    })

    if (res) {
      if (res.data.records.length > 0) {
        const record = res.data.records[0]

        const result = requireEntity(this.findByIdOrNull(record.Id))

        return result
      }
    }
    return null
  }

  async create(draft: typeof SfPricebookEntry.Draft): Promise<typeof SfPricebookEntry .Type> {
    const validated = SfPricebookEntry.validateDraft(draft)
    logger.info('Creando SfPricebookEntry en Salesforce', { validated })

    try {
      const { data } = await this.sf.post<{ id: string }>(this.basePath, validated)
      return (await this.findByIdOrNull(data.id)) as typeof SfPricebookEntry.Type
    } catch (ex: any) {
      try {
        // Si ya existe el registro intentamos obtener la id
        const id = ex.response.data[0].duplicateResult.matchResults[0].matchRecords[0].record.Id
        return (await this.findByIdOrNull(id)) as typeof SfPricebookEntry.Type
      } catch (e) {}

      throw ex
    }
  }

  async update(id: string, draft: typeof SfPricebookEntry.Draft): Promise<void> {
    const validated = SfPricebookEntry.validateDraft(draft)
    logger.info(`Actualizando SfPricebookEntry con Id: ${id}`, { payload: validated })

    await this.sf.patch(`${this.basePath}/${id}`, validated)

    logger.info('SfPricebookEntry actualizado', { id })
  }
}
