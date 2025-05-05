import { SBO_STD_BPAddresses, SBO_STD_BusinessPartner, SBO_STD_ContactEmployees } from '@/shared/sap-b1/schemas/std.business-partner.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SapBPAddresses = createZodModel(
  SBO_STD_BPAddresses.extend({
    // U_SF_Address: z.enum(['Y', 'N']).nullish(),
  })
)

export const SapContactEmployees = createZodModel(
  SBO_STD_ContactEmployees.extend({
    U_SEI_SFID: z.string().nullish(), // TODO: Cambiar a U_SEI_SF_ID
  })
)

export const SapBusinessPartner = createZodModel(
  SBO_STD_BusinessPartner.extend({
    U_SEI_SFID: z.string().nullish(), // TODO: Cambiar a U_SEI_SF_ID
    U_SEI_SFINT_ORI: z.string().nullish(),
    U_STPG_Origin: z.string().nullish(),
    U_STPG_Type: z.string().nullish(),

    BPAddresses: z.array(SapBPAddresses.schema).nullish(),
    ContactEmployees: z.array(SapContactEmployees.schema).nullish(),
  })
)
