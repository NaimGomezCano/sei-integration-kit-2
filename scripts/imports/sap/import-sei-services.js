import { appLogger } from '@/libs/logger';
import { masterSL } from '@/libs/service-layer/instance';
import { ServiceLayerSEIServicesHelper } from '@/libs/service-layer/libs/sei-services';
import cronstrue from 'cronstrue';
import { _DATA_SEIServices } from './data/services';
export async function _Import_SEI_SERVICES(force = false) {
    const helper = new ServiceLayerSEIServicesHelper(masterSL);
    try {
        for (const service of _DATA_SEIServices) {
            try {
                if (!service.Code) {
                    throw new Error('Service Code not found');
                }
                const existingService = await helper.getById(service.Code);
                if (existingService) {
                    if (force) {
                        appLogger.info(`Service ${service.Code} already exists, force updating...`);
                        await helper.update(service.Code, service);
                        continue;
                    }
                    else {
                        appLogger.info(`Service ${service.Code} already exists, skipping...`);
                        continue;
                    }
                }
                const result = await helper.create(service);
                appLogger.info(`Service ${result.Code} created -> Runs in : ${cronstrue.toString(result.U_SEI_Cron || '')}`);
            }
            catch (error) {
                const errMsg = `Error importing SEI_SERVICES: ${error.message || 'Unknown error'}`;
                appLogger.fatal(errMsg);
            }
        }
        appLogger.info('SEI_SERVICES import completed 🎉');
    }
    catch (error) {
        const errMsg = `Error importing SEI_SERVICES: ${error.message || 'Unknown error'}`;
        appLogger.fatal(errMsg);
        throw new Error(errMsg);
    }
}
