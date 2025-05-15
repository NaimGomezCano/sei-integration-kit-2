import { DomainError } from '@/core/errors/domain.error'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { OperationResult } from '@/core/operation-result/schemas/operation-result.schema'
import SapAccountService from '@/domain/accounts/services/sap-account.service'
import { SapBusinessPartnerRepository } from '@/domain/shared/repositories/sap/sap-business-partner.repository'
import { SapContactEmployeesRepository } from '@/domain/shared/repositories/sap/sap-contact-employee.repository'
import { SapContactEmployees } from '@/domain/shared/schemas/sap-business-partner.schema'
import ServiceLayer from '@/shared/sap-b1/service-layer'
import { requireEntity } from '@/shared/utils/require-entity.utils'
import { SfCreateContact, SfUpdateContact } from '../schemas/salesforce-contact.schema'

export default class ContactsService {
  protected readonly sl: ServiceLayer = ServiceLayer.getInstance()
  private accountService = new SapAccountService()
  private readonly contactRepo = new SapContactEmployeesRepository()
  private readonly bpRepo = new SapBusinessPartnerRepository()

  async createContact(salesforceId: string, input: typeof SfCreateContact.Type): Promise<typeof OperationResult.Type> {
    let contactDraft: typeof SapContactEmployees.Draft = {}

    const existingBp = await requireEntity(this.bpRepo.findBySfIdOrNull(salesforceId), { notFoundMessage: `No Account found with SalesforceId '${salesforceId}'` })

    const existingContact = await this.contactRepo.getBySfId(existingBp, input.SalesforceId)
    if (existingContact) {
      throw new DomainError(`Contact with SalesforceId '${input.SalesforceId}' already exists in Account '${salesforceId}'`)
    }

    contactDraft.U_SEI_SFID = input.SalesforceId
    contactDraft.Name = input.Name
    contactDraft.FirstName = input.FirstName
    contactDraft.LastName = input.LastName
    contactDraft.E_Mail = input.Email
    contactDraft.Phone1 = input.Phone1
    contactDraft.MobilePhone = input.MobilePhone
    contactDraft.Title = input.Title
    contactDraft.Position = input.Position

    const validatedContact = SapContactEmployees.validateDraft(contactDraft)

    await this.contactRepo.create(existingBp, validatedContact)

    const updatedBp = await requireEntity(this.bpRepo.findByIdOrNull(existingBp.CardCode!))
    const confirmation = await requireEntity(this.contactRepo.getBySfId(updatedBp, input.SalesforceId))

    return OperationResultBuilder.success(confirmation).build()
  }

  async updateContact(accountSalesforceId: string, salesforceId: string, input: typeof SfUpdateContact.Type): Promise<typeof OperationResult.Type> {
    const bp = await requireEntity(this.bpRepo.findBySfIdOrNull(accountSalesforceId), {
      notFoundMessage: `No Account found with SalesforceId '${accountSalesforceId}'`,
    })

    const existingContact = await requireEntity(this.contactRepo.getBySfId(bp, salesforceId), {
      notFoundMessage: `No Contact found with SalesforceId '${salesforceId}' in Account '${accountSalesforceId}'`,
    })

    existingContact.Name = input.Name
    existingContact.FirstName = input.FirstName
    existingContact.LastName = input.LastName
    existingContact.E_Mail = input.Email
    existingContact.Phone1 = input.Phone1
    existingContact.MobilePhone = input.MobilePhone
    existingContact.Title = input.Title
    existingContact.Position = input.Position

    const validatedContact = SapContactEmployees.validateDraft(existingContact)

    await this.contactRepo.update(bp, validatedContact)

    const updatedBp = await requireEntity(this.bpRepo.findByIdOrNull(bp.CardCode!))
    const response = await requireEntity(this.contactRepo.getBySfId(updatedBp, salesforceId))

    return OperationResultBuilder.success(response).build()
  }

  async getBySalesforceId(accountSalesforceId: string, salesforceId: string): Promise<typeof OperationResult.Type> {
    const bp = await requireEntity(this.bpRepo.findBySfIdOrNull(accountSalesforceId), {
      notFoundMessage: `No Account found with SalesforceId '${accountSalesforceId}'`,
    })

    const responseContact = await requireEntity(this.contactRepo.getBySfId(bp, salesforceId), {
      notFoundMessage: `No Contact found with SalesforceId '${salesforceId}' in Account '${salesforceId}'`,
    })
    return OperationResultBuilder.success(responseContact).build()
  }
}
