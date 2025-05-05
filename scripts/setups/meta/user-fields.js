import { ServiceLayerBoolEnum, ServiceLayerUserFieldTypeEnum } from '@/libs/service-layer/enums/valid-values';
const SEI_APIOGS = [
    {
        Name: 'SEI_Method',
        Description: 'Method',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 10,
        ValidValuesMD: [
            {
                Description: 'GET',
                Value: 'GET',
            },
            {
                Description: 'POST',
                Value: 'POST',
            },
            {
                Description: 'PUT',
                Value: 'PUT',
            },
            {
                Description: 'PATCH',
                Value: 'PATCH',
            },
            {
                Description: 'DELETE',
                Value: 'DELETE',
            },
        ],
    },
    {
        Name: 'SEI_URL',
        Description: 'Request URL',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
    {
        Name: 'SEI_StartDate',
        Description: 'Start Date',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_EndDate',
        Description: 'End Date',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_StatusCode',
        Description: 'Status Code',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.NUMERIC,
    },
    {
        Name: 'SEI_ReqBody',
        Description: 'Request Data',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
    {
        Name: 'SEI_ResBody',
        Description: 'Response Data',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
    {
        Name: 'SEI_Message',
        Description: 'Message',
        TableName: '@SEI_APILOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
];
const SEI_COU_TENANTS = [
    {
        Name: 'SEI_DBName',
        Description: 'Database Name',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_DBUser',
        Description: 'Database User',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_DBPasswd',
        Description: 'Database Password',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_SLUser',
        Description: 'ServiceLayer User',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_SLPasswd',
        Description: 'ServiceLayer Password',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_SLCompany',
        Description: 'ServiceLayer Company',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_CPContentGroup',
        Description: 'Coupa Content Group Name',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_CPAccount',
        Description: 'Coupa Chart of Account Name',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_CPAddress',
        Description: 'Coupa Company Address Name',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_CPAccountGroup',
        Description: 'Coupa Account Group Name',
        TableName: '@SEI_COU_TENANTS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
];
const SEI_COU_LOOKUPS = [
    {
        Name: 'SEI_LookUpType',
        Description: 'LookUp Type',
        TableName: '@SEI_COU_LOOKUPS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_TenantCode',
        Description: 'SBO Tenant Code',
        LinkedTable: 'SEI_COU_TENANTS',
        TableName: '@SEI_COU_LOOKUPS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
    },
    {
        Name: 'SEI_CoupaCode',
        Description: 'Coupa LookUp ID',
        TableName: '@SEI_COU_LOOKUPS',
        Type: ServiceLayerUserFieldTypeEnum.NUMERIC,
    },
];
const SEI_SVLOGS = [
    {
        Name: 'SEI_Service',
        Description: 'Service Code',
        TableName: '@SEI_SVLOGS',
        Mandatory: ServiceLayerBoolEnum.YES,
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_StartDate',
        Description: 'Start Date',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_EndDate',
        Description: 'End Date',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_Status',
        Description: 'Status',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Mandatory: ServiceLayerBoolEnum.YES,
        Size: 1,
        ValidValuesMD: [
            {
                Description: 'Success',
                Value: 'S',
            },
            {
                Description: 'Warning',
                Value: 'W',
            },
            {
                Description: 'Error',
                Value: 'E',
            },
        ],
    },
    {
        Name: 'SEI_Result',
        Description: 'Result Data',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
    {
        Name: 'SEI_Message',
        Description: 'Message',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
    {
        Name: 'SEI_LastRun',
        Description: 'Last Run',
        TableName: '@SEI_SVLOGS',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
];
const SEI_TRACKER = [
    {
        Name: 'SEI_TenantCode',
        Description: 'SBO Tenant Code',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_ObjType',
        Description: 'Object Type',
        TableName: '@SEI_TRACKER',
        Mandatory: ServiceLayerBoolEnum.YES,
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_ObjId',
        Description: 'Object ID',
        TableName: '@SEI_TRACKER',
        Mandatory: ServiceLayerBoolEnum.YES,
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_ObjName',
        Description: 'Object Name',
        TableName: '@SEI_TRACKER',
        Mandatory: ServiceLayerBoolEnum.YES,
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_Action',
        Description: 'Action',
        TableName: '@SEI_TRACKER',
        Size: 1,
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        DefaultValue: 'N',
        ValidValuesMD: [
            {
                Description: 'Add',
                Value: 'A',
            },
            {
                Description: 'Update',
                Value: 'U',
            },
            {
                Description: 'Delete',
                Value: 'D',
            },
            {
                Description: 'Cancel',
                Value: 'C',
            },
            {
                Description: 'Close',
                Value: 'L',
            },
            {
                Description: 'None',
                Value: 'N',
            },
        ],
    },
    {
        Name: 'SEI_LastTrack',
        Description: 'Last Tracked Date',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_Status',
        Description: 'Process Status',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 1,
        DefaultValue: 'P',
        ValidValuesMD: [
            {
                Description: 'Success',
                Value: 'S',
            },
            {
                Description: 'Error',
                Value: 'E',
            },
            {
                Description: 'Pending',
                Value: 'P',
            },
        ],
    },
    {
        Name: 'SEI_StartDate',
        Description: 'Start Date',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_EndDate',
        Description: 'End Date',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_Message',
        Description: 'Message',
        TableName: '@SEI_TRACKER',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
];
const SEI_SERVICES = [
    {
        Name: 'SEI_Desc',
        Description: 'Description',
        TableName: '@SEI_SERVICES',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 254,
    },
    {
        Name: 'SEI_Cron',
        Description: 'Cron',
        TableName: '@SEI_SERVICES',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_Status',
        Description: 'Status',
        TableName: '@SEI_SERVICES',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 1,
        ValidValuesMD: [
            {
                Description: 'Active',
                Value: 'A',
            },
            {
                Description: 'Inactive',
                Value: 'I',
            },
        ],
    },
    {
        Name: 'SEI_Remarks',
        Description: 'Remarks',
        TableName: '@SEI_SERVICES',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
];
const SetupUserFields = [];
SetupUserFields.push(...SEI_APIOGS);
SetupUserFields.push(...SEI_COU_TENANTS);
SetupUserFields.push(...SEI_COU_LOOKUPS);
SetupUserFields.push(...SEI_SERVICES);
SetupUserFields.push(...SEI_SVLOGS);
SetupUserFields.push(...SEI_TRACKER);
// SetupUserFields.push(...SEI_APPPARAMS)
// SetupUserFields.push(...SEI_OLDSTOCK)
export default SetupUserFields;
