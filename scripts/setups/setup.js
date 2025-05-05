import { appLogger } from '@/libs/logger';
import { masterSL } from '@/libs/service-layer/instance';
import { ServiceLayerSetupHelper } from '@/libs/service-layer/libs/setup';
import { parseArgs } from 'util';
import SetupUserFields from './meta/user-fields';
import SetupUserObjects from './meta/user-objects';
import SetupUserTables from './meta/user-tables';
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
});
async function setup() {
    const setupHelper = new ServiceLayerSetupHelper(masterSL);
    const udfs = SetupUserFields;
    const udts = SetupUserTables;
    const udos = SetupUserObjects;
    try {
        if (args.force) {
            appLogger.warn('Force mode enabled');
        }
        const response = await setupHelper.setup(udts, udfs, udos, args.force || false);
        appLogger.info(response);
    }
    catch (error) {
        appLogger.fatal(error);
    }
}
setup();
