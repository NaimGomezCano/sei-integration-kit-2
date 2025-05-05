/*import { env } from '@/env'
import type { Connection as HanaConn } from '@sap/hana-client'
import { ConnectionPool as MSSQLConn } from 'mssql'
import { _Data_SEICoupaTenants } from 'scripts/imports/sap/data/coupa-tenants'
import { appLogger } from '../logger'
import type { SEICoupaTenants } from '../service-layer/schemas/customs/sei-cou-tenants'
import hanaConnection from './connections/hana'
import mssqlConnection from './connections/mssql'

type DBType = 'HANA' | 'MSSQL'

export class Database {
  private connection: MSSQLConn | HanaConn | null = null
  private tenantCode: string | undefined = ''
  private dbType: DBType

  constructor(dbType: DBType) {
    this.dbType = dbType
  }

  public async doQuery<T>(query: string, tenantCode: string = ''): Promise<T> {
    if (!this.connection || this.tenantCode != tenantCode) {
      if (tenantCode == '') {
        await this.connect(env.SBO_DB_NAME!)
      } else {
        const tenant: SEICoupaTenants = _Data_SEICoupaTenants.find((tenant) => tenant.Code === tenantCode)!
        await this.connect(tenant.U_SEI_DBName)
      }
    }
    this.tenantCode = tenantCode

    switch (this.dbType) {
      case 'HANA':
        return await this.doHanaQuery(query)
      case 'MSSQL':
        return await this.doMSSQLQuery(query)
      default:
        throw new Error('Invalid database type')
    }

    this.connection = null
  }

  private async connect(dbName: string) {
    if (this.dbType == 'HANA') {
      this.connection = await hanaConnection(dbName)
    } else if (this.dbType == 'MSSQL') {
      this.connection = await mssqlConnection(dbName)
    }

    return this
  }

  private async doHanaQuery<T>(query: string): Promise<T> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const conn = this.connection as HanaConn
        conn.exec(query, function (err, result: any) {
          if (err) {
            reject(err)
          }

          resolve(result)
        })
      })

      return result
    } catch (error: any) {
      appLogger.error('HANA Query Error: ', error.message)
      throw error
    }
  }

  private async doMSSQLQuery<T>(query: string): Promise<T> {
    try {
      const result = await (this.connection as MSSQLConn).query(query)
      return result.recordset as any
    } catch (error: any) {
      appLogger.error('MSSQL Query Error: ', error.message)
      throw error
    }
  }
}

// export const db = new Database(env.SBO_DB_TYPE || 'MSSQL')
export const db = 'ss' as any
*/
