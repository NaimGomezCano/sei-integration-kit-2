import { appLogger } from '@/libs/logger'

import { masterSL } from '@/libs/service-layer/instance'
import { ServiceLayerParamsHelper } from '@/libs/service-layer/libs/sei-params'
import { _Data_SEIParams } from './data/params'

export async function _Import_SEI_PARAMS(force: boolean = false) {
  const helper = new ServiceLayerParamsHelper(masterSL)
  try {
    for (const param of _Data_SEIParams) {
      try {
        const existingParam = await helper.paramExists(param.Code)

        if (existingParam) {
          if (force) {
            appLogger.info(`Parameter ${param.Code} already exists, force updating...`)
            await helper.updateParam(param.Code, param)
            continue
          } else {
            appLogger.info(`Parameter ${param.Code} already exists, skipping...`)
            continue
          }
        }

        const result = await helper.createParam(param)

        appLogger.info(`Parameter ${result.Code} created`)
      } catch (error: any) {
        const errMsg = `Error importing SEI_PARAMS: ${error.message || 'Unknown error'}`
        appLogger.fatal(errMsg)
      }
    }

    appLogger.info('SEI_PARAMS import completed 🎉')
  } catch (error: any) {
    const errMsg = `Error importing SEI_PARAMS: ${error.message || 'Unknown error'}`
    appLogger.fatal(errMsg)
    throw new Error(errMsg)
  }
}
