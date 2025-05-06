import { handleErrorToOperationResult } from '@/core/error-handling/handle-error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/types'
import { CountryMapper } from '@/domain/shared/country.mapper'
import { SapBusinessPartnerRepository } from '@/domain/shared/repositories/sap/sap-business-partner.repository'
import { SalesforceAccountRepository } from '@/domain/shared/repositories/sf/sf-account.repository'
import { SalesforceContactRepository } from '@/domain/shared/repositories/sf/sf-contact.repository'
import { SapBusinessPartner } from '@/domain/shared/schemas/sap-business-partner.schema'
import { SfAccount } from '@/domain/shared/schemas/sf-account.schema'
import { areAllFieldsFilled } from '@/shared/utils/areAllFieldsFilled'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { IndustryMapper } from '../../shared/industry.mapper'
import { StatesMapper } from '../../shared/states.mapper'
import { AddressService } from './address.service'

export default class SalesforceAccountService {
  private readonly bpRepo = new SapBusinessPartnerRepository()
  private readonly addressService = new AddressService()
  private readonly sfAccountRepo = new SalesforceAccountRepository()
  private readonly sfContactRepo = new SalesforceContactRepository()
  private readonly statesMapper = new StatesMapper()
  private readonly countryMapper = new CountryMapper()
  private readonly industryService = new IndustryMapper()

  private validatePaymentCode(codigo: string | null | undefined): string {
    const codigosValidos = ['CONTADO (C)', 'EFECTIVO (C)', 'RD (C)', 'TAL (C)', 'TPV (C)', 'TPV VIRTUAL (C)', 'TRF (C)', 'TRF POPULAR (C)']

    // Verifica si el código es nulo, indefinido, o una cadena vacía/espacios
    if (!codigo || codigo.trim() === '') {
      return 'OTROS'
    }

    return codigosValidos.includes(codigo.trim()) ? codigo.trim() : 'OTROS'
  }

  stats = {
    total: 0,
    creadas: 0,
    actualizadas: 0,
    errores: 0,
    conSalesforceIdPeroNoExiste: 0,
    salesforceActualizadoEnSAP: 0,
    tiempoInicio: Date.now(),
  }

  async pushSingleAccount(cardCode: string, bp: typeof SapBusinessPartner.Type = {}): Promise<OperationResult> {
    if (!bp.CardCode) {
      // Si no se envia el objeto bp lo obtenemos nosotros
      bp = await requireEntity(this.bpRepo.findByIdOrNull(cardCode))
    }

    let result: OperationResult | any
    const draft: typeof SfAccount.Draft = {}

    logger.info('Inicio sincronización de cuenta', {
      sapId: bp.CardCode,
      razonSocial: bp.CardName,
    })

    try {
      draft.AccountSource = bp.U_STPG_Origin
      draft.ClientType__c = bp.U_STPG_Type
      draft.Description = bp.FreeText
      draft.Industry = this.industryService.getNameByCode(bp.Industry)
      draft.Name = bp.CardName
      draft.OwnerId = '005J9000001CrOiIAK' // null // TODO: No tenemos a los empleados integrados
      draft.PaymentMethod__c = this.validatePaymentCode(bp.PeymentMethodCode)
      draft.Phone = bp.Phone1
      draft.SAP_Account_Id__c = bp.CardCode
      // draft.SocialReason__c // TODO: Este campo no existe en salesforce -> draft.SocialReason__c
      draft.Website = bp.Website

      if (bp.BilltoDefault != null) {
        const sfBillTo = this.addressService.getBillToAddress(bp.BilltoDefault, bp.BPAddresses)
        if (
          sfBillTo &&
          areAllFieldsFilled({
            City: sfBillTo.City,
            Country: sfBillTo.Country,
            ZipCode: sfBillTo.ZipCode,
            State: sfBillTo.State,
            Street: sfBillTo.Street,
          })
        ) {
          draft.BillingCity = sfBillTo.City
          draft.BillingCountry = this.countryMapper.translateSapToSfCode(sfBillTo.Country!)
          draft.BillingPostalCode = sfBillTo.ZipCode
          draft.BillingStateCode = this.statesMapper.translateSapToSfCode(sfBillTo.State!)
          draft.BillingStreet = sfBillTo.Street
        } else {
          draft.BillingCity = 'Ciudad no indicada'
          draft.BillingCountry = 'ES'
          draft.BillingPostalCode = 'Código postal no indicado'
          draft.BillingStateCode = 'M'
          draft.BillingStreet = 'Dirección no indicada completamente'
        }
      }

      if (bp.ShipToDefault != null) {
        const sfShipTo = this.addressService.getShipToAddress(bp.ShipToDefault, bp.BPAddresses)

        if (
          sfShipTo &&
          areAllFieldsFilled({
            City: sfShipTo.City,
            Country: sfShipTo.Country,
            ZipCode: sfShipTo.ZipCode,
            State: sfShipTo.State,
            Street: sfShipTo.Street,
          })
        ) {
          draft.ShippingCity = sfShipTo.City
          draft.ShippingCountry = this.countryMapper.translateSapToSfCode(sfShipTo.Country!)
          draft.ShippingPostalCode = sfShipTo.ZipCode
          draft.ShippingStateCode = this.statesMapper.translateSapToSfCode(sfShipTo.State!)
          draft.ShippingStreet = sfShipTo.Street
        } else {
          draft.ShippingCity = 'Ciudad no indicada'
          draft.ShippingCountry = 'ES'
          draft.ShippingPostalCode = 'Código postal no indicado'
          draft.ShippingStateCode = 'M'
          draft.ShippingStreet = 'Dirección no indicada completamente'
        }
      }

      const account = SfAccount.validateDraft(draft)
      const exists = await this.sfAccountRepo.findByCardCodeOrNull(bp.CardCode!)

      /* if (bp.U_SEI_SFINT_ORI === 'SF') {
        if (exists) {
          if (bp.UpdateDate && exists.LastModifiedDate && bp.UpdateDate > exists.LastModifiedDate) {
            result = OperationResultBuilder.success('Un Account de Salesforce ha sido actualizada en SAP').build()
            this.stats.salesforceActualizadoEnSAP++
          }
        } else {
          result = OperationResultBuilder.success('En SAP tenemos Salesforce ID pero en Salesforce no esta presente el CardCode').build()
          this.stats.conSalesforceIdPeroNoExiste++
        }
      } else {*/
      if (exists) {
        await this.sfAccountRepo.update(exists.Id!, account)
        // bp.U_SEI_SFINT_ORI = 'SF'
        bp.U_SEI_SFID = exists.Id
        await this.bpRepo.update(bp.CardCode!, bp)
        result = OperationResultBuilder.success(exists).build()
        this.stats.actualizadas++
      } else {
        const created = await this.sfAccountRepo.create(account)
        //bp.U_SEI_SFINT_ORI = 'SF'
        bp.U_SEI_SFID = created.Id
        await this.bpRepo.update(bp.CardCode!, bp)
        const confirmation = await requireEntity(this.bpRepo.findByIdOrNull(bp.CardCode!))

        result = OperationResultBuilder.success(created).build()
        this.stats.creadas++
      }
      //}
    } catch (error) {
      this.stats.errores++

      result = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar cuenta', result)
    }

    return result
  }

  async createOrUpdateAccountByCardCode(cardCode: string): Promise<OperationResult> {
    const result = await this.pushSingleAccount(cardCode)
    return result
  }

  async createOrUpdateAccountsBatch(): Promise<OperationResult> {
    let result: any

    try {
      const processResult: OperationResult[] = []

      logger.info('Inicio proceso batch de cuentas SAP → Salesforce')

      await this.bpRepo.processAllBusinessPartners(async (partners: (typeof SapBusinessPartner.Type)[]) => {
        for (const bp of partners) {
          this.stats.total++

          await delay(500)

          const result = await this.pushSingleAccount(bp.CardCode!, bp)
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
