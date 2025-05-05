import { appEnv } from '@/appEnv'
import { logger } from '@/core/logger'
import { internalLogger } from '@/core/logger/internal'
import { createConnection } from '@sap/hana-client'

export async function hanaConnection(db_name: string): Promise<any | null> {
  try {
    const client = createConnection({
      host: appEnv.SBO_DB_HOST,
      port: appEnv.SBO_DB_PORT,
      uid: appEnv.SBO_DB_USER,
      pwd: appEnv.SBO_DB_PASSWD,
    })

    await new Promise<void>((resolve, reject) => {
      client.connect(function (err) {
        if (err) {
          internalLogger.core.error('Error al conectarse con Hana ', err)
          reject(err)
        }
        internalLogger.sql.info('Connection to HANA database stablished')
        client.exec('SET SCHEMA ' + db_name, function (err) {
          if (err) {
            internalLogger.sql.error('Error al ejecutar', err)
            reject(err)
          }
          internalLogger.sql.info('HANA DB Schema set to ' + appEnv.SBO_DB_NAME)
          resolve()
        })
      })
    })

    return client
  } catch (error: any) {
    internalLogger.sql.error('Error connecting to HANA database:', error.message)
    return null
  }
}

export default hanaConnection
