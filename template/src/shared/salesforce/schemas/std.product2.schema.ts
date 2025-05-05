import { z } from 'zod'

export const SF_STD_Product2 = z.object({
  Id: z.string().nullish(),
  Name: z.string().nullish(),
  ProductCode: z.string().nullish(),
  Description: z.string().nullish(),
  IsActive: z.boolean().nullish(),
  CreatedDate: z.string().nullish(),
  CreatedById: z.string().nullish(),
  LastModifiedDate: z.string().nullish(),
  LastModifiedById: z.string().nullish(),
  SystemModstamp: z.string().nullish(),
  Family: z.string().nullish(),
  ExternalId: z.string().nullish(),
  DisplayUrl: z.string().nullish(),
  QuantityUnitOfMeasure: z.string().nullish(),
  IsDeleted: z.boolean().nullish(),
  IsArchived: z.boolean().nullish(),
  LastViewedDate: z.string().nullish(),
  LastReferencedDate: z.string().nullish(),
  StockKeepingUnit: z.string().nullish(),
})

export type SF_STD_Product2 = z.infer<typeof SF_STD_Product2>
