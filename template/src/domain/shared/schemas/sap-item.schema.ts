import { SBO_STD_Item, SBO_STD_ItemPrice } from '@/shared/sap-b1/schemas/std.item.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SapItemPrice = createZodModel(SBO_STD_ItemPrice.extend({}))

export const SapItem = createZodModel(
  SBO_STD_Item.extend({
    U_SEI_SFID: z.string().nullish(),
    U_SEI_SFINT_ORI: z.string().nullish(),
    ItemPrices: z.array(SapItemPrice.schema).nullish(),
  })
)
