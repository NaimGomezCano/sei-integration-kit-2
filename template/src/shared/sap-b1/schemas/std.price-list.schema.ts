import { z } from 'zod'

export const SBO_STD_PriceList = z.object({
  GroupNum: z.string().nullish(),
  BasePriceList: z.number().int().nullish(),
  Factor: z.number().nullish(),
  PriceListNo: z.number().int().nullish(),
  PriceListName: z.string().nullish(),
  IsGrossPrice: z.enum(['tYES', 'tNO']).nullish(),
  Active: z.enum(['tYES', 'tNO']).nullish(),
  ValidFrom: z.string().datetime().nullable().nullish(),
  ValidTo: z.string().datetime().nullable().nullish(),
  DefaultPrimeCurrency: z.string().length(3).nullish(),
  DefaultAdditionalCurrency1: z.string().length(3).nullish(),
  DefaultAdditionalCurrency2: z.string().length(3).nullish(),
  FixedAmount: z.number().nullish(),
})

export type SBO_STD_PriceList = z.infer<typeof SBO_STD_PriceList>
