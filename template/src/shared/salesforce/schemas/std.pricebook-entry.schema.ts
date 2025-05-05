import { z } from 'zod'

export const SF_STD_PricebookEntry = z.object({
  Id: z.string().nullish(),
  Product2Id: z.string().nullish(),
  Pricebook2Id: z.string().nullish(),
  UnitPrice: z.number().nullish(),
  IsActive: z.boolean().nullish(),
  UseStandardPrice: z.boolean().nullish(),
})

export type SF_STD_PricebookEntry = z.infer<typeof SF_STD_PricebookEntry>
