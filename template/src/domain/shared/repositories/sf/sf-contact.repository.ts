import { logger } from '@/core/logger'
import { SalesforceClient } from '@/shared/salesforce/salesforce-api/salesforce-client'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { SfContact } from '../../schemas/sf-contact.schema'

export class SalesforceContactRepository {
  private readonly sf = new SalesforceClient()

  private readonly apiVersion = 'v60.0'

  private get basePath(): string {
    return `/services/data/${this.apiVersion}/sobjects/Contact`
  }

  async findByIdOrNull(id: string): Promise<typeof SfContact.Type | null> {
    logger.info(`Obteniendo Contact por Id: ${id}`)

    try {
      const { data } = await this.sf.get<typeof SfContact.Type>(`${this.basePath}/${id}`)
      return data
    } catch (err: any) {
      if (err.response?.status === 404) {
        logger.info('Contact no encontrado', { id })
        return null
      }
      throw err
    }
  }

  async exists(id: string): Promise<boolean> {
    logger.info(`Verificando existencia de Contact con Id: ${id}`)
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

  async findByCardCodeOrNull(cardCode: string): Promise<typeof SfContact.Type | null> {
    logger.info(`Verificando existencia de Contact con Id: ${cardCode}`)
    const res: any = await this.sf.get<void>(`/services/data/v60.0/query?q=SELECT+Id,Name+FROM+Contact+WHERE+SAP_Account_Id__c='${cardCode}'`, {
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

  async create(draft: typeof SfContact.Draft): Promise<typeof SfContact.Type> {
    const validated = SfContact.validateDraft(draft)
    logger.info('Creando Account en Salesforce', { validated })

    try {
      const { data } = await this.sf.post<{ id: string }>(this.basePath, validated)
      return (await this.findByIdOrNull(data.id)) as typeof SfContact.Type
    } catch (ex: any) {
      try {
        // Si ya existe el registro intentamos obtener la id
        const id = ex.response.data[0].duplicateResult.matchResults[0].matchRecords[0].record.Id
        return (await this.findByIdOrNull(id)) as typeof SfContact.Type
      } catch (e) {}

      throw ex
    }
  }

  async update(id: string, draft: typeof SfContact.Draft): Promise<void> {
    const validated = SfContact.validateDraft(draft)
    logger.info(`Actualizando Account con Id: ${id}`, { payload: validated })

    await this.sf.patch(`${this.basePath}/${id}`, validated)

    logger.info('Account actualizado', { id })
  }

  private async selectableFields(): Promise<string> {
    return Object.keys(SfContact.schema.shape).join(',')
  }
}
