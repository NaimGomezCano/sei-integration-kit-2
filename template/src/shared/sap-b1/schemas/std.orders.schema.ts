import { z } from 'zod'

export const STD_DocumentLine = z.object({
  LineNum: z.number().nullish(),
  ItemCode: z.string().nullish(),
  ItemDescription: z.string().nullish(),
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
})

export type STD_DocumentLine = z.infer<typeof STD_DocumentLine>

export const STD_AddressExtension = z.object({
  ShipToStreet: z.string().nullish(),
  ShipToCity: z.string().nullish(),
  ShipToZipCode: z.string().nullish(),
  ShipToState: z.string().nullish(),
  ShipToCountry: z.string().nullish(),
  BillToStreet: z.string().nullish(),
  BillToCity: z.string().nullish(),
  BillToZipCode: z.string().nullish(),
  BillToState: z.string().nullish(),
  BillToCountry: z.string().nullish(),
})
export type STD_AddressExtension = z.infer<typeof STD_AddressExtension>

export const STD_SalesOrder = z.object({
  DocEntry: z.number().nullish(),
  DocNum: z.number().nullish(),
  CardCode: z.string().nullish(),
  CardName: z.string().nullish(),
  DocDate: z.string().nullish(),
  DocDueDate: z.string().nullish(),
  TaxDate: z.string().nullish(),
  DocTotal: z.number().nullish(),
  DocTotalSys: z.number().nullish(),
  Comments: z.string().nullish(),
  SalesPersonCode: z.number().nullish(),
  PaymentGroupCode: z.number().nullish(),
  PaymentMethod: z.string().nullish(),
  DocCurrency: z.string().nullish(),
  DiscountPercent: z.number().nullish(),
  Series: z.number().nullish(),
  FederalTaxID: z.string().nullish(),

  AddressExtension: STD_AddressExtension.nullish(),
  DocumentLines: z.array(STD_DocumentLine),
})
export type STD_SalesOrder = z.infer<typeof STD_SalesOrder>
