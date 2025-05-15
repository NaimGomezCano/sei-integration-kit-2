import { appEnv } from '@/appEnv'
import { DomainError } from '@/core/errors/domain.error'
import { logger } from '@/core/logger'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/schemas/operation-result.schema'
import { SapBusinessPartnerRepository } from '@/domain/shared/repositories/sap/sap-business-partner.repository'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { IndustryMapper } from '../../shared/industry.mapper'
import { SapBusinessPartner } from '../../shared/schemas/sap-business-partner.schema'
import { StatesMapper } from '../../shared/states.mapper'
import { SfCreateClient, SfUpdateClient } from '../schemas/salesforce-client.schema'
import { AddressService } from './address.service'

export default class SapAccountService {
  private readonly bpRepo = new SapBusinessPartnerRepository()
  private readonly addressService = new AddressService()
  private readonly statesMapper = new StatesMapper()
  private readonly industryMapper = new IndustryMapper()

  async updateAccount(salesforceId: string, input: typeof SfUpdateClient.Draft): Promise<typeof OperationResult.Type> {
    logger.info(`Iniciando actualización de cuenta con SalesforceId: ${salesforceId}`)

    const existingBp = await requireEntity(this.bpRepo.findBySfIdOrNull(salesforceId), {
      notFoundMessage: `No Account found with SalesforceId '${salesforceId}'`,
    })

    logger.info(`Cuenta encontrada: ${existingBp.CardCode}`)

    const bpDraft: typeof SapBusinessPartner.Draft = {}

    bpDraft.U_STPG_Origin = input.Origin
    bpDraft.U_STPG_Type = input.STPGType
    bpDraft.PeymentMethodCode = input.PaymentMethodCode
    bpDraft.CardName = input.CardName
    bpDraft.CardForeignName = input.CardFName
    bpDraft.FederalTaxID = input.FederalTaxID != null ? 'ES' + input.FederalTaxID : undefined
    bpDraft.Industry = this.industryMapper.getCodeByName(input.Industry)
    bpDraft.Phone1 = input.Phone1
    bpDraft.Website = input.Website
    bpDraft.FreeText = input.FreeText

    if (input.Active === false) {
      bpDraft.Frozen = 'tYES'
      bpDraft.FrozenRemarks = 'Desactivado por integración'
      bpDraft.FrozenFrom = null
      bpDraft.FrozenTo = null
      bpDraft.Valid = 'tNO'
      bpDraft.ValidFrom = null
      bpDraft.ValidTo = null
      bpDraft.ValidRemarks = null
    } else {
      bpDraft.Frozen = 'tNO'
      bpDraft.FrozenRemarks = null
      bpDraft.FrozenFrom = null
      bpDraft.FrozenTo = null
      bpDraft.Valid = 'tYES'
      bpDraft.ValidFrom = null
      bpDraft.ValidTo = null
      bpDraft.ValidRemarks = null
    }

    bpDraft.BPAddresses = []

    if (this.addressService.isBillToAddressPresent(input)) {
      this.addressService.validateBillToAddress(input)
      const existingBillToRowNum = this.addressService.getRowNumForUpdate(existingBp.BilltoDefault, existingBp.BPAddresses, 'bo_BillTo')
      let billTo: any
      if (existingBillToRowNum) {
        billTo = this.addressService.buildBillToAddress(input, existingBp.BilltoDefault!, existingBp.CardCode!, existingBillToRowNum)
      } else {
        billTo = this.addressService.buildBillToAddress(input, 'FACTURACION', existingBp.CardCode!, existingBillToRowNum)
      }
      bpDraft.BPAddresses.push(billTo)
      logger.info(existingBillToRowNum !== undefined ? 'Dirección de facturación actualizada' : 'Dirección de facturación creada')
    }

    if (this.addressService.isShipToAddressPresent(input)) {
      this.addressService.validateShipToAddress(input)
      const existingShipToRowNum = this.addressService.getRowNumForUpdate(existingBp.ShipToDefault, existingBp.BPAddresses, 'bo_ShipTo')
      let shipTo: any
      if (existingShipToRowNum) {
        shipTo = this.addressService.buildShipToAddress(input, existingBp.ShipToDefault!, existingBp.CardCode!, existingShipToRowNum)
      } else {
        shipTo = this.addressService.buildShipToAddress(input, 'ENVIO', existingBp.CardCode!, existingShipToRowNum)
      }

      bpDraft.BPAddresses!.push(shipTo)
      logger.info(existingShipToRowNum !== undefined ? 'Dirección de envío actualizada' : 'Dirección de envío creada')
      // }
    }

    const bp = SapBusinessPartner.validateCleanDraft(bpDraft)

    logger.info(`Actualizando cuenta ${existingBp.CardCode} en repositorio...`)
    await this.bpRepo.update(existingBp.CardCode!, bp)
    const confirmation = await requireEntity(this.bpRepo.findByIdOrNull(existingBp.CardCode!))
    logger.info(`Cuenta actualizada correctamente: ${existingBp.CardCode}`)
    return OperationResultBuilder.success(confirmation).build()
  }

  async createAccount(input: typeof SfCreateClient.Type): Promise<typeof OperationResult.Type> {
    logger.info(`Iniciando creación de cuenta con SalesforceId: ${input.SalesforceId}`)

    const exists = await this.bpRepo.existsBySfId(input.SalesforceId!)
    if (exists) {
      logger.error(`Ya existe una cuenta con SalesforceId: ${input.SalesforceId}`)
      throw new DomainError(`Account with SalesforceId '${input.SalesforceId}' already exists`)
    }

    logger.info('Validando y construyendo datos de cuenta...')

    let bpDraft: typeof SapBusinessPartner.Draft = {}

    //bpDraft.CardCode = input.CardCode

    bpDraft.U_SEI_SFINT_ORI = 'SF'
    bpDraft.Series = Number(appEnv.BP_CARDCODE_SERIES)
    bpDraft.U_STPG_Origin = input.Origin
    bpDraft.U_STPG_Type = input.STPGType
    bpDraft.PeymentMethodCode = input.PaymentMethodCode
    bpDraft.U_SEI_SFID = input.SalesforceId
    bpDraft.CardName = input.CardName
    bpDraft.CardForeignName = input.CardFName
    bpDraft.FederalTaxID = input.FederalTaxID != null ? 'ES' + input.FederalTaxID : undefined
    bpDraft.Industry = this.industryMapper.getCodeByName(input.Industry)
    bpDraft.Phone1 = input.Phone1
    bpDraft.Website = input.Website
    bpDraft.FreeText = input.FreeText

    bpDraft.BPAddresses = []

    if (
      this.addressService.isAddressProvided({
        Street: input.BillToStreet,
        ZipCode: input.BillToZipCode,
        City: input.BillToCity,
        Country: input.BillToCountry,
        State: input.BillToState,
      })
    ) {
      logger.info('Dirección de facturación detectada. Validando...')
      this.addressService.validateBillToAddress(input)

      bpDraft.BPAddresses.push({
        AddressName: `FACTURACION`,
        Street: input.BillToStreet,
        ZipCode: input.BillToZipCode,
        City: input.BillToCity,
        Country: input.BillToCountry,
        State: this.statesMapper.translateSfToSapCode(input.BillToState!),
        AddressType: 'bo_BillTo',
      })
      logger.info('Dirección de facturación añadida')
    }

    if (
      this.addressService.isAddressProvided({
        Street: input.ShipToStreet,
        ZipCode: input.ShipToZipCode,
        City: input.ShipToCity,
        Country: input.ShipToCountry,
        State: input.ShipToState,
      })
    ) {
      logger.info('Dirección de envío detectada. Validando...')
      this.addressService.validateShipToAddress(input)

      bpDraft.BPAddresses.push({
        //AddressName: `${input.ShipToStreet}, ${input.ShipToZipCode} ${input.ShipToCity} ${input.ShipToCountry}`,
        AddressName: `ENVIO`,
        Street: input.ShipToStreet,
        ZipCode: input.ShipToZipCode,
        City: input.ShipToCity,
        Country: input.ShipToCountry,
        State: this.statesMapper.translateSfToSapCode(input.BillToState!),
        AddressType: 'bo_ShipTo',
      })

      logger.info('Dirección de envío añadida')
    }

    logger.info(`Creando cuenta con CardCode: ${input.CardCode}`)
    const bp = SapBusinessPartner.validateDraft(bpDraft)
    const created = await this.bpRepo.create(bp)

    logger.info(`Cuenta creada correctamente con SalesforceId: ${input.SalesforceId}`)
    return OperationResultBuilder.success(created).build()
  }

  async getBySalesforceId(salesforceId: string): Promise<typeof OperationResult.Type> {
    const bp = await requireEntity(this.bpRepo.findBySfIdOrNull(salesforceId), {
      notFoundMessage: `No Account found with SalesforceId '${salesforceId}'`,
    })

    return OperationResultBuilder.success(bp).build()
  }
}
