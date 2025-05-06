import { z } from 'zod'

export const SF_STD_Contact = z.object({
  Id: z.string().nullish(),
  Name: z.string().nullish(),
  FirstName: z.string().nullish(),
  LastName: z.string().nullish(),
  Email: z.string().nullish(),
  Phone: z.string().nullish(),
  MobilePhone: z.string().nullish(),
  Title: z.string().nullish(),
  Department: z.string().nullish(),
  AccountId: z.string().nullish(),
})
export type SF_STD_Contact = z.infer<typeof SF_STD_Contact>
