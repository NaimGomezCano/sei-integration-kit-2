import { appLogger } from '@/libs/logger'
import { MultiTenantSetupHelper } from '@/libs/service-layer/libs/multi-tenant-setup'
import { parseArgs } from 'util'
import MultiTenantSetupUserFields from './multi-meta/user-fields'
import MultiTenantSetupUserObjects from './multi-meta/user-objects'
import MultiTenantSetupUserTables from './multi-meta/user-tables'

//Road map -> Also add Parameters, Transactions, PostTransactions, Functions, Procedures, Views, ThirdParties data, etc.

const { values: args } = parseArgs({
  args: Bun.argv,
  options: {
    force: {
      type: 'boolean',
    },
  },
  strict: true,
  allowPositionals: true,
})

async function setup() {
  const setupHelper = new MultiTenantSetupHelper()

  const udfs = MultiTenantSetupUserFields
  const udts = MultiTenantSetupUserTables
  const udos = MultiTenantSetupUserObjects

  try {
    if (args.force) {
      appLogger.warn('Force mode enabled')
    }
    const response = await setupHelper.setup(udts, udfs, udos, args.force || false)
    appLogger.info(response)
  } catch (error: any) {
    appLogger.fatal(error)
  }
}

setup()
