import { z } from 'zod'

export const SF_STD_Pricebook = z.object({
  Id: z.string().nullish(),
  IsDeleted: z.boolean().nullish(),
  Name: z.string().nullish(),
  CreatedDate: z.string().nullish(),
  CreatedById: z.string().nullish(),
  LastModifiedDate: z.string().nullish(),
  LastModifiedById: z.string().nullish(),
  SystemModstamp: z.string().nullish(),
  LastViewedDate: z.string().nullish(),
  LastReferencedDate: z.string().nullish(),
  IsActive: z.boolean().nullish(),
  IsArchived: z.boolean().nullish(),
  Description: z.string().nullish(),
  IsStandard: z.boolean().nullish(),
})

export type SF_STD_Pricebook = z.infer<typeof SF_STD_Pricebook>
