import { SF_STD_Product2 } from '@/shared/salesforce/schemas/std.product2.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfProduct2 = createZodModel(
  SF_STD_Product2.extend({
  })
)
