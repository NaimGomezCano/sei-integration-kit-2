import { ServiceLayerUserTableTypeEnum } from '@/libs/service-layer/enums/valid-values';
const SEI_APILOGS = {
    TableName: 'SEI_APILOGS',
    TableDescription: 'SEI - API Logs',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SEI_COU_TENANTS = {
    TableName: 'SEI_COU_TENANTS',
    TableDescription: 'SEI - SBO Tenants',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SEI_COU_LOOKUPS = {
    TableName: 'SEI_COU_LOOKUPS',
    TableDescription: 'SEI - Coupa Lookups Map',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SEI_TRACKER = {
    TableName: 'SEI_TRACKER',
    TableDescription: 'SEI - Entities Tracker',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SEI_SERVICES = {
    TableName: 'SEI_SERVICES',
    TableDescription: 'SEI - Services',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SEI_SVLOGS = {
    TableName: 'SEI_SVLOGS',
    TableDescription: 'SEI - Service Logs',
    TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
};
const SetupUserTables = [];
SetupUserTables.push(SEI_APILOGS);
SetupUserTables.push(SEI_COU_TENANTS);
SetupUserTables.push(SEI_COU_LOOKUPS);
SetupUserTables.push(SEI_TRACKER);
SetupUserTables.push(SEI_SERVICES);
SetupUserTables.push(SEI_SVLOGS);
// SetupUserTables.push(SEI_APPPARAMS)
// SetupUserTables.push(SEI_OLDSTOCK)
export default SetupUserTables;
