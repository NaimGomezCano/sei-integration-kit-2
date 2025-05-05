import { SF_STD_Pricebook } from '@/shared/salesforce/schemas/std.pricebook.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfPricebook = createZodModel(
  SF_STD_Pricebook.extend({
    SAP_Pricebook2_Id__c: z.number().nullish(),
  })
)
