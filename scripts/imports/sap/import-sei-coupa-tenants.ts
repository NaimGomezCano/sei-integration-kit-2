import { appLogger } from '@/libs/logger'

import { masterSL } from '@/libs/service-layer/instance'
import { _Data_SEICoupaTenants } from './data/coupa-tenants'

export async function _Import_SEI_COUPA_TENANTS(force: boolean = false) {
  try {
    for (const tenant of _Data_SEICoupaTenants) {
      try {
        if (!tenant.Code) {
          throw new Error('Coupa tenant Code not found')
        }

        const existingService = await masterSL.getById('U_SEI_COU_TENANTS', tenant.Code)

        if (existingService) {
          if (force) {
            appLogger.info(`Coupa tenant ${tenant.Code} already exists, force updating...`)
            await masterSL.patch('U_SEI_COU_TENANTS', tenant.Code, tenant)
            continue
          } else {
            appLogger.info(`Coupa tenant ${tenant.Code} already exists, skipping...`)
            continue
          }
        }

        const result = await masterSL.post('U_SEI_COU_TENANTS', tenant)

        appLogger.info(`Coupa tenant ${result.Code} created`)
      } catch (error: any) {
        const errMsg = `Error importing SEI_SERVICES: ${error.message || 'Unknown error'}`
        appLogger.fatal(errMsg)
      }
    }

    appLogger.info('(SEI_COU_Tenants) Coupa tenents import completed 🎉')
  } catch (error: any) {
    const errMsg = `Error importing SEI_SERVICES: ${error.message || 'Unknown error'}`
    appLogger.fatal(errMsg)
    throw new Error(errMsg)
  }
}
