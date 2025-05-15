import { SF_STD_Order } from '@/shared/salesforce/schemas/std.order.schema'
import { SF_STD_PricebookEntry } from '@/shared/salesforce/schemas/std.pricebook-entry.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfOrder = createZodModel(
  SF_STD_Order.extend({
    SAP_Doc_Num__c: z.string().nullable().nullish(),
    SAP_Order_Id__c: z.string().nullable().nullish(),
  })
)
