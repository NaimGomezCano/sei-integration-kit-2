import { SBO_STD_BPAddresses } from '@/shared/sap-b1/schemas/std.business-partner.schema'
import { SBO_STD_Item } from '@/shared/sap-b1/schemas/std.item.schema'
import { SBO_STD_PriceList } from '@/shared/sap-b1/schemas/std.price-list.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SapPriceList = createZodModel(
  SBO_STD_PriceList.extend({
    U_SEI_SFID: z.string().nullish(),
    U_SEI_SFINT_ORI: z.string().nullish(),
    
  })
)
