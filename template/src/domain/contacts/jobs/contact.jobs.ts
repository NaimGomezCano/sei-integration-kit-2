import { createJobProxy } from '@/core/jobs/job-proxy'
import SalesforceContactService from '../services/sf-contact.service'

const sfContactService = new SalesforceContactService()

export const contactJobs = createJobProxy('contacts-worker', {
  async sfCreateorUpdateContactsBatch() {
    return await sfContactService.createOrUpdateContactsBatch()
  },
})
