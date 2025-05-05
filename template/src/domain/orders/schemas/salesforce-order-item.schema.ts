import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfOrderItemSchema = z.object({
  SalesforceId: z.string().nullish(),
  ItemDescription: z.string().nullish(),
  STPGExpiration: z.string().nullish(),
  DocEntry: z.number().nullish(),
  ItemCode: z.string().nullish(),
  Quantity: z.number().nullish(),
  LineTotal: z.number().nullish(),
  GrossTotal: z.number().nullish(),
  Price: z.number().nullish(),
})

export const SfCreateOrderItem = createZodModel(SfOrderItemSchema)
export const SfUpdateOrderItem = createZodModel(SfOrderItemSchema)
