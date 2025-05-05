import type { ServiceLayerBoolEnum, ServiceLayerUserTableTypeEnum } from '../enums/valid-values'

export type ServiceLayerUserTableRes = {
  TableName: string
  TableDescription: string
  TableType: ServiceLayerUserTableTypeEnum
  Archivable?: ServiceLayerBoolEnum
  ArchiveDateField?: string
  DisplayMenu?: ServiceLayerBoolEnum
  ApplyAuthorization?: ServiceLayerBoolEnum
}

export type ServiceLayerUserTableReq = ServiceLayerUserTableRes
