export enum ServiceLayerBoolEnum {
  YES = 'tYES',
  NO = 'tNO',
}

export enum ServiceLayerDocStatusEnum {
  OPEN = 'bost_Open',
  CLOSED = 'bost_Close',
}

export enum ServiceLayerDocTypeEnum {
  Items = 'dDocument_Items',
  Service = 'dDocument_Service',
}

export enum ServiceLayerObjCodeEnum {
  Quotations = 'oQuotations',
  SalesOrders = 'oOrders',
  Invoices = 'oInvoices',
  DeliveryNotes = 'oDeliveryNotes',
  Returns = 'oReturns',
  BusinessPartners = 'oBusinessPartners',
  Items = 'oItems',
  ItemGroups = 'oItemGroups',
}

// export enum ServiceLayerUserFieldSubTypeEnum {
//   NONE = 'st_None',
//   ALPHA_ADDRESS = 'st_Address',
//   ALPHA_PHONE = 'st_Phone',
//   ALPHA_IMAGE = 'st_Image',
//   ALPHA_CHECKBOX = 'st_Checkbox',
//   DATE_TIME = 'st_Time',
//   FLOAT_RATE = 'st_Rate',
//   FLOAT_SUM = 'st_Sum',
//   FLOAT_PRICE = 'st_Price',
//   FLOAT_QUANTITY = 'st_Quantity',
//   FLOAT_PERCENTAGE = 'st_Percentage',
//   FLOAT_MEASUREMENT = 'st_Measurement',
//   TEXT_LINK = 'st_Link',
// }

export enum ServiceLayerUserFieldTypeEnum {
  ALPHANUMERIC = 'db_Alpha',
  TEXT = 'db_Memo',
  NUMERIC = 'db_Numeric',
  FLOAT = 'db_Float',
  DATE = 'db_Date',
}

export enum ServiceLayerUserFieldNumericSubTypeEnum {
  NONE = 'st_None',
}

export enum ServiceLayerUserFieldDateTimeSubTypeEnum {
  TIME = 'st_Time',
}

export enum ServiceLayerUserFieldAlphaSubTypeEnum {
  ADDRESS = 'st_Address',
  PHONE = 'st_Phone',
  IMAGE = 'st_Image',
  CHECKBOX = 'st_Checkbox',
}

export enum ServiceLayerUserFieldFloatSubTypeEnum {
  RATE = 'st_Rate',
  SUM = 'st_Sum',
  PRICE = 'st_Price',
  QUANTITY = 'st_Quantity',
  PERCENTAGE = 'st_Percentage',
  MEASUREMENT = 'st_Measurement',
}

export enum ServiceLayerUserFieldTextSubTypeEnum {
  LINK = 'st_Link',
}

export enum ServiceLayerUserTableTypeEnum {
  MASTER_DATA = 'bott_MasterData',
  MASTER_DATA_LINE = 'bott_MasterDataLines',
  DOCUMENT = 'bott_Document',
  DOCUMENT_LINE = 'bott_DocumentLines',
  NO_OBJECT = 'bott_NoObject',
  NO_OBJECT_AUTO_INCREMENT = 'bott_NoObjectAutoIncrement',
}

export enum ServiceLayerBusinessPartnerTypeEnum {
  CUSTOMER = 'cCustomer',
  LEAD = 'cLead',
  SUPPLIER = 'cSupplier',
}

export enum ServiceLayerSEIServiceStatusEnum {
  RUNNING = 'R',
  STOPPED = 'S',
  PAUSED = 'P',
}

export enum ServiceLayerSEIServicesTypeEnum {
  HTTP = 'http',
  BINARY = 'bin',
  SQL = 'sql',
}

export enum ServiceLayerSEIServiceLogStatusEnum {
  SUCCESS = 'S',
  WARNING = 'W',
  ERROR = 'E',
}

export enum ServiceLayerSEITrackerActionEnum {
  ADD = 'A',
  UPDATE = 'U',
  CLOSE = 'L',
  CANCEL = 'C',
  DELETE = 'D',
  NONE = 'N',
}

export enum ServiceLayerSEITrackerStatusEnum {
  PENDING = 'P',
  SUCCESS = 'S',
  ERROR = 'E',
}
