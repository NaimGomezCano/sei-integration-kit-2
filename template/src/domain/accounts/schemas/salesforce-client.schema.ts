import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

const SfClientSchema = z.object({
  SalesforceId: z.string().nullish(),
  Active: z.boolean().nullish(),
  Origin: z.string().nullish(),
  BillToDefault: z.string().nullish(),
  ShipToDefault: z.string().nullish(),
  BillToCity: z.string().nullish(),
  BillToCountry: z.string().nullish(),
  BillToZipCode: z.string().nullish(),
  BillToState: z.string().nullish(),
  BillToStreet: z.string().nullish(),
  FederalTaxID: z.string().nullish(),
  STPGType: z.string().nullish(),
  FreeText: z.string().nullish(),
  Industry: z.string().nullish(),
  CardName: z.string().nullish(),
  PaymentMethodCode: z.string().nullish(),
  Phone1: z.string().nullish(),
  CardFName: z.string().nullish(),
  Website: z.string().nullish(),
  ShipToStreet: z.string().nullish(),
  ShipToZipCode: z.string().nullish(),
  ShipToCity: z.string().nullish(),
  ShipToCountry: z.string().nullish(),
  ShipToState: z.string().nullish(),
  CardCode: z.string().nullish(), // este campo solo estará en Create
})

export const SfCreateClient = createZodModel(SfClientSchema)

export const SfUpdateClient = createZodModel(
  SfClientSchema.extend({
    SalesforceId: z.string().nullish(),
  })
)
