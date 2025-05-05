import { createJobProxy } from '@/core/jobs/job-proxy'
import { SfCreateClient } from '../schemas/salesforce-client.schema'
import AccountToSfService from '../services/salesforce-account.service'
import SapAccountService from '../services/sap-account.service'

const sapAccountService = new SapAccountService()
const sfAccountService = new AccountToSfService()

export const accountJobs = createJobProxy('accounts-worker', {
 /* async sapCreateAccount(body: typeof SfCreateClient.Type) {
    return await sapAccountService.createAccount(body)
  },*/

  async sfCreateorUpdateAccountsBatch() {
    return await sfAccountService.createOrUpdateAccountsBatch()
  },
})
