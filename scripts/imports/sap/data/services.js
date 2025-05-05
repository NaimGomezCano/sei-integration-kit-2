import { ServiceLayerSEIServiceStatusEnum } from '@/libs/service-layer/enums/valid-values';
export const _DATA_SEIServices = [
    {
        Code: 'Suppliers',
        Name: 'Suppliers',
        U_SEI_Desc: 'Sync suppliers to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 5 * * * *',
    },
    {
        Code: 'CostCenters',
        Name: 'Cost Centers',
        U_SEI_Desc: 'Sync pending cost centers to Coupa',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 10 * * * *',
    },
    {
        Code: 'Users',
        Name: 'Users',
        U_SEI_Desc: 'Sync users to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 15 * * * *',
    },
    {
        Code: 'PurchaseOrders',
        Name: 'Purchase Orders',
        U_SEI_Desc: 'Sync purchase orders to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 20 * * * *',
    },
    {
        Code: 'DeliveryNotes',
        Name: 'Delivery Notes',
        U_SEI_Desc: 'Sync delivery notes to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 25 * * * *',
    },
    {
        Code: 'Invoices',
        Name: 'Invoices',
        U_SEI_Desc: 'Sync invoices to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 30 * * * *',
    },
    {
        Code: 'Payments',
        Name: 'Payments',
        U_SEI_Desc: 'Sync payments to Coupa by date',
        U_SEI_Status: ServiceLayerSEIServiceStatusEnum.ACTIVE,
        U_SEI_Cron: '0 35 * * * *',
    },
];
