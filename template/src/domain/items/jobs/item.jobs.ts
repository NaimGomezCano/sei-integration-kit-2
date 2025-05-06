import { createJobProxy } from '@/core/jobs/job-proxy'
import SalesforcePricebookEntryService from '../services/sf-pricebook-entry.service'
import SalesforcePricebookService from '../services/sf-pricebook.service'
import SalesforceProductService from '../services/sf-products.service'

const sfProductService = new SalesforceProductService()
const sfPriceBook = new SalesforcePricebookService()
const sfPriceBookEntry = new SalesforcePricebookEntryService()

export const itemJobs = createJobProxy('accounts-worker', {
  async sfCreateorUpdateProductsBatch() {
    return await sfProductService.createOrUpdateProductsBatch()
  },
  async sfCreateorUpdatePricebooksBatch() {
    return await sfPriceBook.createOrUpdatePricebooksBatch()
  },
  async sfCreateorUpdatePricebooksEntryBatch() {
    return await sfPriceBookEntry.createOrUpdatePricebooksEntryBatch()
  },
})
