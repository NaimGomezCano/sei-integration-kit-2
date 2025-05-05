import { appLogger } from '@/libs/logger';
import { multiTenantSL } from '@/libs/service-layer/instance';
import { _Data_SQLQueries } from './data/sql-queries';
//FIx
export async function _Import_SQL_QUERIES(force = false) {
    try {
        await multiTenantSL.loadChildSL();
        for (const query of _Data_SQLQueries) {
            for (const [tenant, sl] of globalThis.childSL) {
                try {
                    const existsQuery = await sl.getById('SQLQueries', query.SqlCode);
                    if (existsQuery) {
                        if (!force) {
                            appLogger.info(`(${tenant}) SQL Query already exists: ${query.SqlCode}`);
                            continue;
                        }
                        else {
                            appLogger.info(`(${tenant}) Updating SQL Query: ${query.SqlCode}...`);
                            await sl.patch('SQLQueries', query.SqlCode, query);
                            appLogger.info(`(${tenant}) SQL Query updated: ${query.SqlCode}`);
                        }
                    }
                    else {
                        appLogger.info(`(${tenant}) Creating SQL Query: ${query.SqlCode}...`);
                        await sl.post('SQLQueries', query);
                        appLogger.info(`(${tenant}) SQL Query created: ${query.SqlCode}`);
                    }
                }
                catch (error) {
                    const errMsg = `Error importing SQL Query: ${error.message || 'Unknown error'}`;
                    appLogger.fatal(errMsg);
                }
            }
        }
        appLogger.info('SQL Queries imported successfully 🎉');
    }
    catch (error) {
        const errMsg = `Error importing SQL Queries: ${error.message || 'Unknown error'}`;
        appLogger.fatal(errMsg);
    }
}
