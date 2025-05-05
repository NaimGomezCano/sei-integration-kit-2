import { STD_DocumentLine, STD_SalesOrder } from '@/shared/sap-b1/schemas/std.orders.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SapSalesOrderLine = createZodModel(
  STD_DocumentLine.extend({
    U_SEI_SFID: z.string().nullish(), // TODO: Cambiar a U_SEI_SF_ID
    STPGExpiration: z.string().nullish(), // TODO: Cambiar a U_SEI_SF_ID
  })
)

export const SapSalesOrder = createZodModel(
  STD_SalesOrder.extend({
    U_SEI_SFID: z.string().nullish(), // TODO: Cambiar a U_SEI_SF_ID
    DocumentLines: z.array(SapSalesOrderLine.schema),
  })
)
