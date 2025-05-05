import ServiceLayer from '@/shared/sap-b1/service-layer'
import { ServiceLayerEntity } from '@/shared/sap-b1/service-layer/enums/entities'
import { SapBusinessPartner, SapContactEmployees } from '../../schemas/sap-business-partner.schema'

export class SapContactEmployeesRepository {
  private readonly sl = ServiceLayer.getInstance()

  async update(bp: typeof SapBusinessPartner.Type, updatedContact: typeof SapContactEmployees.Type): Promise<void> {
    // const updatedContact = bp.ContactEmployees?.find((c) => c.U_SEI_SFID === updatedContact.U_SEI_SFID)

    bp.ContactEmployees = [updatedContact]

    await this.sl.patch(ServiceLayerEntity.BusinessPartners, bp.CardCode!, bp)
  }

  async create(bp: typeof SapBusinessPartner.Type, contact: typeof SapContactEmployees.Type): Promise<void> {
    /*const updatedBp: typeof SapBusinessPartnerDTO.Type = {
      ...bp,
      ContactEmployees: [...(bp.ContactEmployees ?? []), contact],
    }*/

    if (!bp.ContactEmployees) {
      bp.ContactEmployees = []
    }
    bp.ContactEmployees = [contact]

    await this.sl.patch(ServiceLayerEntity.BusinessPartners, bp.CardCode!, bp)
  }

  async getBySfId(bp: typeof SapBusinessPartner.Type, contactSalesforceId: string): Promise<typeof SapContactEmployees.Type | null> {
    return bp.ContactEmployees?.find((c) => c.U_SEI_SFID === contactSalesforceId) ?? null
  }
}
