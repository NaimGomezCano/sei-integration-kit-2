import { handleErrorToOperationResult } from '@/core/error-handling/handle-error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/types'
import { AddressService } from '@/domain/accounts/services/address.service'
import { CountryMapper } from '@/domain/shared/country.mapper'
import { SapBusinessPartnerRepository } from '@/domain/shared/repositories/sap/sap-business-partner.repository'
import { SalesforceAccountRepository } from '@/domain/shared/repositories/sf/sf-account.repository'
import { SalesforceContactRepository } from '@/domain/shared/repositories/sf/sf-contact.repository'
import { SapBusinessPartner } from '@/domain/shared/schemas/sap-business-partner.schema'
import { SfContact } from '@/domain/shared/schemas/sf-contact.schema'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { IndustryMapper } from '../../shared/industry.mapper'
import { StatesMapper } from '../../shared/states.mapper'

export default class SalesforceContactService {
  private readonly bpRepo = new SapBusinessPartnerRepository()
  private readonly addressService = new AddressService()
  private readonly sfAccountRepo = new SalesforceAccountRepository()
  private readonly sfContactRepo = new SalesforceContactRepository()
  private readonly statesMapper = new StatesMapper()
  private readonly countryMapper = new CountryMapper()
  private readonly industryService = new IndustryMapper()

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    conSalesforceIdPeroNoExiste: 0,
    salesforceActualizadoEnSAP: 0,
    tiempoInicio: Date.now(),
  }

  async pushSingleContact(cardCode: string, bp: typeof SapBusinessPartner.Type = {}): Promise<OperationResult> {
    if (!bp.CardCode) {
      // Si no se envia el objeto bp lo obtenemos nosotros
      bp = await requireEntity(this.bpRepo.findByIdOrNull(cardCode))
    }

    const contacts = bp.ContactEmployees

    let result: OperationResult | any
    const draft: typeof SfContact.Draft = {}

    try {
      if (contacts?.length) {
        for (const contact of contacts) {
          draft.FirstName = contact.FirstName ?? 'Nombre no establecido'
          draft.LastName = contact.LastName ?? 'Apellido no establecido'
          draft.Email = contact.E_Mail ?? 'test@example.com'
          draft.Phone = contact.Phone1 ?? '000000000'
          draft.MobilePhone = contact.MobilePhone ?? '000000000'
          draft.Title = contact.Title
          draft.Department = contact.Position
          draft.AccountId = bp.U_SEI_SFID

          const newContact = SfContact.validateDraft(draft)
          const exists = await this.sfContactRepo.findByCardCodeOrNull(contact.InternalCode!)

          if (exists) {
            await this.sfContactRepo.update(exists.Id!, newContact)
            contact.U_SEI_SFID = exists.Id
            await this.bpRepo.update(bp.CardCode!, bp)
            result = OperationResultBuilder.success(exists).build()
            this.stats.actualizadas++
          } else {
            const created = await this.sfContactRepo.create(newContact)
            contact.U_SEI_SFID = created.Id
            await this.bpRepo.update(bp.CardCode!, bp)
            const confirmation = await requireEntity(this.bpRepo.findByIdOrNull(bp.CardCode!))
            result = OperationResultBuilder.success(created).build()
            this.stats.creadas++
          }
        }
      }
    } catch (error) {
      this.stats.errores++

      result = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar cuenta', result)
    }

    return result
  }

  async createOrUpdateContactByCardCode(cardCode: string): Promise<OperationResult> {
    const result = await this.pushSingleContact(cardCode)
    return result
  }

  async createOrUpdateContactsBatch(): Promise<OperationResult> {
    let result: any

    try {
      const processResult: OperationResult[] = []

      logger.info('Inicio proceso batch de cuentas SAP → Salesforce')

      await this.bpRepo.processAllBusinessPartners(async (partners: (typeof SapBusinessPartner.Type)[]) => {
        for (const bp of partners) {
          this.stats.total++
          await delay(500)

          const result = await this.pushSingleContact(bp.CardCode!, bp)
          processResult.push(result)

          logger.info(`Cuentas procesadas hasta ahora: ${processResult.length}`)

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
