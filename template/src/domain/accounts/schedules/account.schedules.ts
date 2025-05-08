import { schedule } from '@/core/croner/croner-scheduler'
import { RegisterSchedules } from '@/core/croner/decorators'
import { accountJobs } from '../jobs/account.jobs'

@RegisterSchedules()
export class AccountJobSchedules {
  scheduleJobs() {
    schedule({
      job: accountJobs.sfCreateorUpdateAccountsBatch,
      cron: '0 4 * * *',
      runOnInit: false,
    })
  }
}
