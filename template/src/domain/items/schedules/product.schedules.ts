import { schedule } from '@/core/croner/croner-scheduler'
import { RegisterSchedules } from '@/core/croner/decorators'
import { itemJobs } from '../jobs/item.jobs'

@RegisterSchedules()
export class ProductJobSchedules {
  scheduleJobs() {
    schedule({
      job: itemJobs.sfCreateorUpdateProductsBatch,
      cron: '0 2 * * *',
      runOnInit: true,
    }),
      schedule({
        job: itemJobs.sfCreateorUpdatePricebooksBatch,
        cron: '0 4 * * *',
        runOnInit: false,
      }),
      schedule({
        job: itemJobs.sfCreateorUpdatePricebooksEntryBatch,
        cron: '0 6 * * *',
        runOnInit: false,
      })
  }
}
