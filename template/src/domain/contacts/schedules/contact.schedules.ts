import { schedule } from '@/core/croner/croner-scheduler'
import { RegisterSchedules } from '@/core/croner/decorators'
import { contactJobs } from '../jobs/contact.jobs'

@RegisterSchedules()
export class ContactJobSchedules {
  scheduleJobs() {
    schedule({
      job: contactJobs.sfCreateorUpdateContactsBatch,
      cron: '0 8 * * *',
      runOnInit: false, //  runOnInit: true,,
    })
  }
}
