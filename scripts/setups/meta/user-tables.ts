import { ServiceLayerUserTableTypeEnum } from '@/libs/service-layer/enums/valid-values'
import type { ServiceLayerUserTableReq } from '@/libs/service-layer/types/user-table'

const SEI_APILOGS: ServiceLayerUserTableReq = {
  TableName: 'SEI_APILOGS',
  TableDescription: 'SEI - API Logs',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SEI_COU_TENANTS: ServiceLayerUserTableReq = {
  TableName: 'SEI_COU_TENANTS',
  TableDescription: 'SEI - SBO Tenants',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SEI_COU_LOOKUPS: ServiceLayerUserTableReq = {
  TableName: 'SEI_COU_LOOKUPS',
  TableDescription: 'SEI - Coupa Lookups Map',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SEI_TRACKER: ServiceLayerUserTableReq = {
  TableName: 'SEI_TRACKER',
  TableDescription: 'SEI - Entities Tracker',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SEI_SERVICES: ServiceLayerUserTableReq = {
  TableName: 'SEI_SERVICES',
  TableDescription: 'SEI - Services',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SEI_SVLOGS: ServiceLayerUserTableReq = {
  TableName: 'SEI_SVLOGS',
  TableDescription: 'SEI - Service Logs',
  TableType: ServiceLayerUserTableTypeEnum.NO_OBJECT,
}

const SetupUserTables: ServiceLayerUserTableReq[] = []

SetupUserTables.push(SEI_APILOGS)
SetupUserTables.push(SEI_COU_TENANTS)
SetupUserTables.push(SEI_COU_LOOKUPS)
SetupUserTables.push(SEI_TRACKER)
SetupUserTables.push(SEI_SERVICES)
SetupUserTables.push(SEI_SVLOGS)
// SetupUserTables.push(SEI_APPPARAMS)
// SetupUserTables.push(SEI_OLDSTOCK)

export default SetupUserTables
