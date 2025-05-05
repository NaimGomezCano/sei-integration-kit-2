import { SF_STD_PricebookEntry } from '@/shared/salesforce/schemas/std.pricebook-entry.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfPricebookEntry = createZodModel(
  SF_STD_PricebookEntry.extend({
    SAP_Composite_Id__c: z.string().nullable().nullish(),
  })
)
