import { SF_STD_Contact } from '@/shared/salesforce/schemas/std.contact.schema'
import { createZodModel } from '@/shared/utils/create-model'

export const SfContact = createZodModel(SF_STD_Contact.extend({}))
