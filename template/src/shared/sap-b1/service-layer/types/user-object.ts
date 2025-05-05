import type { ServiceLayerBoolEnum, ServiceLayerUserFieldTypeEnum } from '../enums/valid-values'

export type ServiceLayerUserObjectRes = {
  Code: string
  Name: string
  TableName: string
  LogTableName?: string
  CanCreateDefaultForm?: ServiceLayerBoolEnum
  ObjectType: string
  ExtensionName?: string
  CanCancel?: string
  CanDelete?: ServiceLayerBoolEnum
  CanLog?: ServiceLayerBoolEnum
  ManageSeries?: string
  CanFind?: ServiceLayerBoolEnum
  CanYearTransfer?: string
  CanClose?: string
  OverwriteDllfile?: ServiceLayerBoolEnum
  UseUniqueFormType?: ServiceLayerBoolEnum
  CanArchive?: string
  MenuItem?: ServiceLayerBoolEnum
  MenuCaption?: string
  FatherMenuID?: number
  Position?: number
  MenuUID?: string
  EnableEnhancedForm?: string
  RebuildEnhancedForm?: string
  FormSRF?: string
  ApplyAuthorization?: string
  UserObjectMD_ChildTables?: ServiceLayerUDOChildTable[]
  UserObjectMD_FindColumns?: ServiceLayerUDOFindColumn[]
  UserObjectMD_FormColumns?: ServiceLayerUDOFindColumn[]
  UserObjectMD_EnhancedFormColumns?: ServiceLayerUDOFormColumns[]
}

export type ServiceLayerUserObjectReq = ServiceLayerUserObjectRes

export interface ServiceLayerUDOFindColumn {
  Code: string
  ColumnNumber: number
  ColumnAlias: string
  ColumnDescription: string
}

export interface ServiceLayerUDOChildTable {
  SonNumber: string
  ObjectName: string
  TableName: string
}

export interface ServiceLayerUDOFormColumns {
  FormID: string
  ItemID: string
  ColumnAlias: string
  ColumnName: string
  Description: string
  DataType: ServiceLayerUserFieldTypeEnum
  EditSize: number
  LinkedTable: string
  LinkType: string
  LinkedUDO: string
  Mandatory: ServiceLayerBoolEnum
  CanOpen: ServiceLayerBoolEnum
}
