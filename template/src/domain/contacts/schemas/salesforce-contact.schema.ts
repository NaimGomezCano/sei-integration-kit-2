import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

const SfContactSchema = z.object({
  SalesforceId: z.string().nullish(),
  FirstName: z.string().nullish(),
  LastName: z.string().nullish(),
  E_Mail: z.string().nullish(),
  Phone1: z.string().nullish(),
  Position: z.string().nullish(),
  MobilePhone: z.string().nullish(),
  Title: z.string().nullish(),
  Name: z.string().nullish(),
})

export const SfCreateContact = createZodModel(SfContactSchema.extend({}))
export const SfUpdateContact = createZodModel(SfContactSchema.extend({}))
