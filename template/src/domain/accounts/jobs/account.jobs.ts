import { createJobProxy } from '@/core/jobs/job-proxy'
import { SfCreateClient } from '../schemas/salesforce-client.schema'
import AccountToSfService from '../services/sf-account.service'
import SapAccountService from '../services/sap-account.service'

const sapAccountService = new SapAccountService()
const sfAccountService = new AccountToSfService()

export const accountJobs = createJobProxy('accounts-worker', {

  async sfCreateorUpdateAccountsBatch() {
    return await sfAccountService.createOrUpdateAccountsBatch()
  },
})
