import { appEnv } from '@/appEnv'
import { logger } from '@/core/logger'
import { internalLogger } from '@/core/logger/internal'
import { ConnectionPool } from 'mssql'

export async function mssqlConnection(dbName: string): Promise<ConnectionPool | null> {
  try {
    const conn = new ConnectionPool({
      server: appEnv.SBO_DB_HOST!!,
      database: dbName,
      user: appEnv.SBO_DB_USER,
      password: appEnv.SBO_DB_PASSWD,
      port: appEnv.SBO_DB_PORT,
      requestTimeout: 0,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true,
      },
    })

    await conn.connect()

    internalLogger.sql.info('Connection to MSSQL database stablish successfully')

    return conn
  } catch (error: any) {
    internalLogger.sql.error('Error connecting to MSSQL database:', error.message)
    return null
  }
}

export default mssqlConnection
