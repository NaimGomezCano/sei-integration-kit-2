import { z } from 'zod'

export const SBO_STD_UoMPrice = z.object({
  Price: z.number().nullish(),
  Currency: z.string().nullish(),
  UoMEntry: z.number().nullish(),
})
export type SBO_STD_UoMPrice = z.infer<typeof SBO_STD_UoMPrice>

export const SBO_STD_ItemPrice = z.object({
  PriceList: z.number(),
  Price: z.number(),
  Currency: z.string().nullish(),
  AdditionalPrice1: z.number().nullish(),
  AdditionalCurrency1: z.string().nullish(),
  AdditionalPrice2: z.number().nullish(),
  AdditionalCurrency2: z.string().nullish(),
  BasePriceList: z.number(),
  Factor: z.number(),
  UoMPrices: z.array(SBO_STD_UoMPrice),
})
export type SBO_STD_ItemPrice = z.infer<typeof SBO_STD_ItemPrice>

export const SBO_STD_Item = z.object({
  LineNum: z.number().nullish(),
  ItemCode: z.string().nullish(),
  ItemName: z.string().nullish(),
  ItemDescription: z.string().nullish(),
  Valid: z.string().nullish(),
  Quantity: z.number().nullish(),
  Price: z.number().nullish(),
  LineTotal: z.number().nullish(),
  DiscountPercent: z.number().nullish(),
  WarehouseCode: z.string().nullish(),
  VatGroup: z.string().nullish(),
  TaxCode: z.string().nullish(),
  FreeText: z.string().nullish(),
  GrossProfit: z.number().nullish(),
  LineStatus: z.string().nullish(),
  UoMCode: z.string().nullish(),
  UnitPrice: z.number().nullish(),
  ItemPrices: z.array(SBO_STD_ItemPrice).nullish(),
})

export type SBO_STD_Item = z.infer<typeof SBO_STD_Item>
