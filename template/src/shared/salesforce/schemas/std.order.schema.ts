import { z } from 'zod'

export const SF_STD_Order = z.object({
  AccountId: z.string().nullish(),
  EffectiveDate: z.string().nullish(),
  Status: z.string().nullish(),
  Description: z.string().nullish(),
})
export type SF_STD_Order = z.infer<typeof SF_STD_Order>
