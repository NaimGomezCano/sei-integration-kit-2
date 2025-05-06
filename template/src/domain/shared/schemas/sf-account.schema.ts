import { SF_STD_Account } from '@/shared/salesforce/schemas/std.account.schema'
import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'

export const SfAccount = createZodModel(
  SF_STD_Account.extend({
    SAP_Account_Id__c: z.string().nullish(),
    CIF__c: z.string().nullish(),
    PurchaseFrequency__c: z.string().nullish(),
    LastPurchaseDate__c: z.string().nullish(),
    LastVisitDate__c: z.string().nullish(),
    CurrentProvider__c: z.string().nullish(),
    NoBuyReason__c: z.string().nullish(),
    PaymentMethod__c: z.string().nullish(),
    CompanyName__c: z.string().nullish(),
    MonthlyBillingRange__c: z.string().nullish(),
    InterestedProducts__c: z.string().nullish(),
    ClientType__c: z.string().nullish(),
  })
)
