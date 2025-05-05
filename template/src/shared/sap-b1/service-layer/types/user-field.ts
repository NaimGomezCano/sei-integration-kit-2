import type {
  ServiceLayerBoolEnum,
  ServiceLayerUserFieldAlphaSubTypeEnum,
  ServiceLayerUserFieldDateTimeSubTypeEnum,
  ServiceLayerUserFieldFloatSubTypeEnum,
  ServiceLayerUserFieldNumericSubTypeEnum,
  ServiceLayerUserFieldTextSubTypeEnum,
  ServiceLayerUserFieldTypeEnum,
} from '../enums/valid-values'

export type ServiceLayerUserFieldRes = {
  FieldID: number
  Name: string
  Type: ServiceLayerUserFieldTypeEnum
  Size?: number
  Description: string
  SubType?: SubTypeForType<ServiceLayerUserFieldRes['Type']> | 'st_None'
  LinkedTable?: string
  DefaultValue?: string
  TableName: string
  EditSize?: number
  Mandatory?: ServiceLayerBoolEnum
  LinkedUDO?: string
  LinkedSystemObject?: string
  ValidValuesMD?: any[]
} & {}

type SubTypeForType<T extends ServiceLayerUserFieldTypeEnum> = T extends ServiceLayerUserFieldTypeEnum.NUMERIC
  ? ServiceLayerUserFieldNumericSubTypeEnum
  : T extends ServiceLayerUserFieldTypeEnum.DATE
  ? ServiceLayerUserFieldDateTimeSubTypeEnum
  : T extends ServiceLayerUserFieldTypeEnum.ALPHANUMERIC
  ? ServiceLayerUserFieldAlphaSubTypeEnum
  : T extends ServiceLayerUserFieldTypeEnum.FLOAT
  ? ServiceLayerUserFieldFloatSubTypeEnum
  : T extends ServiceLayerUserFieldTypeEnum.TEXT
  ? ServiceLayerUserFieldTextSubTypeEnum
  : never // Fallback for unsupported types

export type ServiceLayerUserFieldReq = Omit<ServiceLayerUserFieldRes, 'FieldID'>
