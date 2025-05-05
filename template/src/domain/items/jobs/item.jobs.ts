import { createJobProxy } from '@/core/jobs/job-proxy'
import SalesforcePricebookService from '../services/sf-pricebook.service'
import SalesforceProductService from '../services/sf-products.service'

const sfProductService = new SalesforceProductService()
const sfPriceBook = new SalesforcePricebookService()

export const itemJobs = createJobProxy('accounts-worker', {
  async sfCreateorUpdateProductsBatch() {
    return await sfProductService.createOrUpdateProductsBatch()
  },
  async sfCreateorUpdatePricebooksBatch() {
    return await sfPriceBook.createOrUpdatePricebooksBatch()
  },
})
