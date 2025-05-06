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
import { SfAccount } from '@/domain/shared/schemas/sf-account.schema'
import { areAllFieldsFilled } from '@/shared/utils/areAllFieldsFilled'
import { delay } from '@/shared/utils/delay'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { IndustryMapper } from '../../shared/industry.mapper'
import { StatesMapper } from '../../shared/states.mapper'

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
    if (!codigo || codigo.trim() === '') return 'OTROS'
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
    // ———————————————————————————————————————————————— Preparación
    if (!bp.CardCode) {
      bp = await requireEntity(this.bpRepo.findByIdOrNull(cardCode))
    }

    logger.info('Inicio sincronización de cuenta', {
      sapId: bp.CardCode,
      razonSocial: bp.CardName,
    })

    const draft: typeof SfAccount.Draft = {}

    try {
      // —————————————————————————————————————————— Map fields
      draft.AccountSource = bp.U_STPG_Origin
      draft.ClientType__c = bp.U_STPG_Type
      draft.Description = bp.FreeText
      draft.Industry = this.industryService.getNameByCode(bp.Industry)
      draft.Name = bp.CardName
      draft.OwnerId = '005J9000001CrOiIAK' // TODO: employees ↔ SF
      draft.PaymentMethod__c = this.validatePaymentCode(bp.PeymentMethodCode)
      draft.Phone = bp.Phone1
      draft.SAP_Account_Id__c = bp.CardCode
      draft.Website = bp.Website

      // Billing
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

      // Shipping
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

      // —————————————————————————————————————————— Alta / actualización
      if (exists) {
        await this.sfAccountRepo.update(exists.Id!, account)
        bp.U_SEI_SFID = exists.Id
        await this.bpRepo.update(bp.CardCode!, bp)

        this.stats.actualizadas++
        logger.info('Cuenta actualizada en SF', {
          sapId: bp.CardCode,
          sfId: exists.Id,
        })

        return OperationResultBuilder.success(exists).build()
      } else {
        const created = await this.sfAccountRepo.create(account)
        bp.U_SEI_SFID = created.Id
        await this.bpRepo.update(bp.CardCode!, bp)

        this.stats.creadas++
        logger.info('Cuenta creada en SF', {
          sapId: bp.CardCode,
          sfId: created.Id,
        })

        return OperationResultBuilder.success(created).build()
      }
    } catch (error) {
      this.stats.errores++

      const opErr = handleErrorToOperationResult(error)
      logger.error('Error al sincronizar cuenta', {
        sapId: bp.CardCode,
        error: opErr,
      })
      return opErr
    }
  }

  async createOrUpdateAccountByCardCode(cardCode: string): Promise<OperationResult> {
    return this.pushSingleAccount(cardCode)
  }

  async createOrUpdateAccountsBatch(): Promise<OperationResult> {
    try {
      const processResult: OperationResult[] = []
      logger.info('Inicio proceso batch SAP → Salesforce')

      await this.bpRepo.processAllBusinessPartners(async (partners: (typeof SapBusinessPartner.Type)[]) => {
        for (const bp of partners) {
          this.stats.total++
          await delay(500)

          const res = await this.pushSingleAccount(bp.CardCode!, bp)
          processResult.push(res)

          logger.info('BP procesada', {
            cardCode: bp.CardCode,
            progreso: `${this.stats.total} BPs`,
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
      logger.error('Error en batch SAP → Salesforce', { error: opErr })
      return opErr
    }
  }
}
