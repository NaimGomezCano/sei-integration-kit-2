export type ServiceLayerLoginReq = {
  CompanyDB: string
  UserName: string
  Password: string
}

export type ServiceLayerLoginRes = {
  Version: string
  SessionId: string
  SessionTimeout: number
}
