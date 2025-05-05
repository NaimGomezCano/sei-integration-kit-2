import { ServiceLayerUserFieldTypeEnum } from '@/libs/service-layer/enums/valid-values';
const Documents = [
    {
        Name: 'SEI_CoupaID',
        Description: 'Coupa ID',
        TableName: 'OPOR',
        Type: ServiceLayerUserFieldTypeEnum.NUMERIC,
    },
    {
        Name: 'SEI_Source',
        Description: 'Source',
        ValidValuesMD: [
            {
                Value: 'coupa',
                Description: 'Coupa',
            },
            {
                Value: 'sap',
                Description: 'SAP',
            },
        ],
        DefaultValue: 'sap',
        TableName: 'OPOR',
        Type: ServiceLayerUserFieldTypeEnum.ALPHANUMERIC,
        Size: 50,
    },
    {
        Name: 'SEI_CoupaID',
        Description: 'Coupa ID',
        TableName: 'POR1',
        Type: ServiceLayerUserFieldTypeEnum.NUMERIC,
    },
    {
        Name: 'SEI_CoupaNestedID',
        Description: 'Coupa Nested ID',
        TableName: 'PDN1',
        Type: ServiceLayerUserFieldTypeEnum.TEXT,
    },
];
const MultiTenantSetupUserFields = [];
MultiTenantSetupUserFields.push(...Documents);
export default MultiTenantSetupUserFields;
