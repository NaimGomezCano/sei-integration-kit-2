import { dateFromString } from '@/shared/utils/datetime'
import { z } from 'zod'

export const SBO_STD_ContactEmployees = z.object({
  DateOfBirth: z.string().nullish(),
  E_Mail: z.string().nullish(),
  Name: z.string().nullish(),
  FirstName: z.string().nullish(),
  LastName: z.string().nullish(),
  MobilePhone: z.string().nullish(),
  Phone1: z.string().nullish(),
  Title: z.string().nullish(),
  InternalCode: z.number().nullish(),
  Position: z.string().nullish(),
})
export type SBO_STD_ContactEmployees = z.infer<typeof SBO_STD_ContactEmployees>

export const SBO_STD_BPAddresses = z.object({
  AddressName: z.string(),
  Street: z.string().nullish(),
  Block: z.string().nullish(),
  ZipCode: z.string().nullish(),
  City: z.string().nullish(),
  Country: z.string().nullish(),
  State: z.string().nullish(),
  AddressType: z.enum(['bo_BillTo', 'bo_ShipTo']).nullish(),

  RowNum: z.number().nullish(),
  BPCode: z.string().nullish(),
})
export type SBO_STD_BPAddresses = z.infer<typeof SBO_STD_BPAddresses>

export const SBO_STD_BusinessPartner = z.object({
  Series: z.number().nullish(),
  CardCode: z.string().nullish(),
  CardName: z.string().nullish(),
  CardType: z.string().nullish(),
  GroupCode: z.number().nullish(),
  CardForeignName: z.string().nullish(),
  Address: z.string().nullish(),
  ZipCode: z.string().nullish(),
  Phone1: z.string().nullish(),
  FederalTaxID: z.string().nullish(),
  FreeText: z.string().nullish(),
  Currency: z.string().nullish(),
  Website: z.string().nullish(),
  BilltoDefault: z.string().nullish(),
  ShipToDefault: z.string().nullish(),
  BillToState: z.string().nullish(),
  CardFName: z.string().nullish(),
  PeymentMethodCode: z.string().nullish(),
  Street: z.string().nullish(),
  Block: z.string().nullish(),
  ShipToState: z.string().nullish(),
  Industry: z.number().nullish(),
  Country: z.string().nullish(),
  City: z.string().nullish(),
  State1: z.string().nullish(),
  UpdateDate: dateFromString.nullish(),

  BPAddresses: z.array(SBO_STD_BPAddresses).nullish(),
  ContactEmployees: z.array(SBO_STD_ContactEmployees).nullish(),
})
export type SBO_STD_BusinessPartner = z.infer<typeof SBO_STD_BusinessPartner>
