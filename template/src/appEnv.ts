import fs from 'fs'
import path from 'path'
import stripJsonComments from 'strip-json-comments'
import { z } from 'zod'
import { internalLogger } from './core/logger/internal'
import { getEnvironment } from './shared/utils/getEnvironment'

// ⇢ Resuelve primero el entorno
const { NODE_ENV, IS_DEPLOY } = getEnvironment()
internalLogger.env.info(`🧩 Entorno detectado: ${NODE_ENV}`)
internalLogger.env.info(`🚀 Modo Deploy: ${IS_DEPLOY ? 'Activo' : 'Desactivado'}`)

// ⇢ Cargar configuración
const baseConfigPath = path.resolve(`config.${NODE_ENV}.jsonc`)
const localConfigPath = path.resolve(`config.${NODE_ENV}.local.jsonc`)

let rawConfig: any = {}

if (IS_DEPLOY) {
  rawConfig = { ...process.env }
  internalLogger.env.info('✅ Configuración cargada desde variables de entorno (deploy)')
} else {
  if (fs.existsSync(baseConfigPath)) {
    rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(baseConfigPath, 'utf-8')))
    internalLogger.env.info(`✅ Configuración cargada desde: ${baseConfigPath}`)
  }
  if (fs.existsSync(localConfigPath)) {
    const local = JSON.parse(stripJsonComments(fs.readFileSync(localConfigPath, 'utf-8')))
    rawConfig = { ...rawConfig, ...local }
    internalLogger.env.info(`✅ Configuración local sobreescrita desde: ${localConfigPath}`)
  }
}

// Helpers Zod -------------------------------------------------------------
const booleanString = z
  .union([z.string(), z.boolean()])
  .transform((v) => {
    if (typeof v === 'string') return v.trim().toLowerCase() === 'true'
    return v === true
  })
  .pipe(z.boolean())

// Esquema -----------------------------------------------------------------
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default(NODE_ENV),
  IS_DEPLOY: z.coerce.boolean().default(IS_DEPLOY),

  BP_CARDCODE_SERIES: z.string(),

  SF_CLIENT_ID: z.string(),
  SF_CLIENT_SECRET: z.string(),
  SF_USERNAME: z.string(),
  SF_PASSWORD: z.string(),

  APP_NAME: z.string(),
  APP_BASE_URL: z.string().url(),
  APP_PORT: z.coerce.number(),
  DEPLOY_DIR: z.string(),

  SBO_DB_TYPE: z.enum(['MSSQL', 'HANA']),
  SBO_DB_HOST: z.string(),
  SBO_DB_PORT: z.coerce.number(),
  SBO_DB_USER: z.string(),
  SBO_DB_PASSWD: z.string(),
  SBO_DB_NAME: z.string(),

  SBO_SL_URL: z.string().url(),
  SBO_SL_USER: z.string(),
  SBO_SL_PASSWD: z.string(),
  SBO_SL_DB_NAME: z.string(),

  SBO_API_GATEWAY_BASE_URL: z.string().nullish(),
  SBO_API_GATEWAY_USER: z.string().nullish(),
  SBO_API_GATEWAY_PASSWD: z.string().nullish(),
  SBO_API_GATEWAY_DB_NAME: z.string().nullish(),
  SBO_API_GATEWAY_DB_INSTANCE: z.string().nullish(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),

  JWT_COOKIE_NAME: z.string(),

  NODE_TLS_REJECT_UNAUTHORIZED: z.coerce.number(),
})

// Validar y exportar -------------------------------------------------------
export const appEnv = configSchema.parse(rawConfig)
internalLogger.env.info('✅ Configuración validada correctamente con Zod')
internalLogger.env.debug('🔍 Configuración final', appEnv)
