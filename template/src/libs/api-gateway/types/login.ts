export type SBOApiGatewayLoginReq = {
  CompanyDB: string
  UserName: string
  Password: string
  DBInstance: string
}

export type SBOApiGatewayLoginRes = {
  Version: string
  SessionTimeout: number
}
