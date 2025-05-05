//Migratae inicial data

import { appLogger } from '@/libs/logger'
import { parseArgs } from 'util'

import { _Import_SEI_COUPA_TENANTS } from './sap/import-sei-coupa-tenants'
import { _Import_SEI_SERVICES } from './sap/import-sei-services'
import { _Import_SQL_QUERIES } from './sap/import-sql-queries'

const { values: args } = parseArgs({
  args: Bun.argv,
  options: {
    force: {
      type: 'boolean',
    },
    sap: {
      type: 'boolean',
    },
    coupa: {
      type: 'boolean',
    },
    target: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true,
})

async function importData() {
  try {
    const importAll = !args.sap && !args.coupa

    if (importAll || args.sap) {
      appLogger.info('Importing SAP data...')

      if (!args.target || args.target === 'coupa-tenants') {
        await _Import_SEI_COUPA_TENANTS()
      }

      if (!args.target || args.target === 'sql-queries') {
        await _Import_SQL_QUERIES()
      }

      // if (!args.target || args.target === 'sei-params') {
      //   await _Import_SEI_PARAMS(args.force || false)
      // }

      if (!args.target || args.target === 'sei-services') {
        await _Import_SEI_SERVICES(args.force || false)
      }
    }

    if (importAll || args.coupa) {
      appLogger.info('Importing Coupa data...')
    }
  } catch (error) {
    appLogger.fatal(error)
  }
}

importData()
