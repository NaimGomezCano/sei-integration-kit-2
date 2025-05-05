import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'
import { SfOrderItemSchema } from './salesforce-order-item.schema'

const SfOrderSchema = z.object({
  SalesforceId: z.string().nullish(),
  DocEntry: z.number().nullish(),
  DocNum: z.number().nullish(),

  CardCode: z.string().nullish(),
  CreateDate: z.string().nullish(), // Fecha y hora en ISO 8601
  DocTotal: z.number().nullish(),
  DocDate: z.string().nullish(), // Solo fecha YYYY-MM-DD
  DocDueDate: z.string().nullish(), // Me han pedido no poner el DocDueDate
  CntctCode: z.number().nullish(),
  OrderItems: z.array(SfOrderItemSchema).nullish(),
})

export const SfCreateOrder = createZodModel(SfOrderSchema)
export const SfUpdateOrder = createZodModel(SfOrderSchema)
