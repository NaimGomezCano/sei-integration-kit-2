export enum ServiceLayerEntity {
  //Auth
  Login = 'Login',
  Logout = 'Logout',

  //Master data
  BusinessPartners = 'BusinessPartners',
  BusinessPartnerGroups = 'BusinessPartnerGroups',
  Contacts = 'Contacts',
  PaymentTermsTypes = 'PaymentTermsTypes',
  ShippingTypes = 'ShippingTypes',
  SEI_Series = 'U_SEISERIE',
  Users = 'Users',

  //Drafts
  Drafts = 'Drafts',
  StockTransferDrafts = 'StockTransferDrafts',
  PaymentDrafts = 'PaymentDrafts',
  Items = 'Items',
  ItemGroups = 'ItemGroups',
  PriceLists = 'PriceLists',
  Manufacturers = 'Manufacturers',
  Countries = 'Countries',
  Currencies = 'Currencies',

  //Sales
  SalesQuotations = 'Quotations',
  SalesOrders = 'Orders',
  SalesDelivery = 'DeliveryNotes',
  SalesInvoices = 'Invoices',
  SalesCreditNotes = 'CreditNotes',
  SalesReturns = 'Returns',
  SalesDownPayments = 'DownPayments',

  //Purchase
  PurchaseQuotations = 'PurchaseQuotations',
  PurchaseRequests = 'PurchaseRequests',
  PurchaseOrders = 'PurchaseOrders',
  PurchaseDelivery = 'PurchaseDeliveryNotes',
  PurchaseInvoices = 'PurchaseInvoices',
  PurchaseCreditNotes = 'PurchaseCreditNotes',
  PurchaseReturns = 'PurchaseReturns',
  PurchaseDownPayments = 'PurchaseDownPayments',

  //Inventory & Production
  ProductTrees = 'ProductTrees',
  ProductionOrders = 'ProductionOrders',
  InventoryEntries = 'InventoryGenEntries',
  InventoryExits = 'InventoryGenExits',
  StockTransfers = 'StockTransfers',
  PickLists = 'PickLists',
  SpecialPrices = 'SpecialPrices',

  //Finance
  IncomingPayments = 'IncomingPayments',

  //Structure
  UserFields = 'UserFieldsMD',
  UserTables = 'UserTablesMD',
  UserObjects = 'UserObjectsMD',

  //UDT & UDO
  SEI_Parameters = 'U_SEI_APPPARAMS',
  SEI_Tracker = 'U_SEI_TRACKER',
  SEI_Services = 'U_SEI_SERVICES',
  SEI_ServiceLogs = 'U_SEI_SVLOGS',
  SEI_APILogs = 'U_SEI_APILOGS',
  SEI_PORTAL_REPORTS_MAP = 'U_SEI_PORTAL_RPTS',

  //Services
  QueryService_PostQuery = 'QueryService_PostQuery',
  CompanyService_GetItemPrice = 'CompanyService_GetItemPrice',
  Service_GetCoCompanyService_GetCompanyInfompanyInfo = 'CompanyService_GetCompanyInfo',

  UnitOfMeasurementsService_GetList = 'UnitOfMeasurementsService_GetList',
  UnitOfMeasurements = 'UnitOfMeasurements',
  //Custom
  CustomScript = 'seidor/CustomScript',
}
