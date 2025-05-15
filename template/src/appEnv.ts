import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import stripJsonComments from 'strip-json-comments'
import { z } from 'zod'
import { internalLogger } from './core/logger/internal'

internalLogger.env.info('Cargando variables de entorno cargadas desde .env.deploy y argumentos')

// 🧠 Leer argumentos como --env=production y --deploy=true
const envArg = process.argv.find((arg) => arg.startsWith('--env='))
const deployArg = process.argv.find((arg) => arg === '--deploy=true')

internalLogger.env.info('envArg', { envArg: envArg })
internalLogger.env.info('deployArg', { deployArg: deployArg })
internalLogger.env.info('process.env.NODE_ENV', { 'process.env.NODE_ENV': process.env.NODE_ENV })

const parsedNodeEnv = envArg?.split('=')[1] ?? process.env.NODE_ENV
const isDeploy = deployArg ? 'true' : process.env.IS_DEPLOY

// ✅ Cargar .env.deploy si estamos en modo deploy
if (isDeploy === 'true') {
  const envFilePath = path.resolve(__dirname, '.env.deploy')
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath })
    internalLogger.env.info('✅ Variables de entorno cargadas desde .env.deploy')
  } else {
    internalLogger.env.error('❌ Archivo .env.deploy no encontrado, abortando.')
    process.exit(1)
  }
}

// Validar NODE_ENV
const NODE_ENV_VALUES = ['development', 'test', 'production'] as const
type NodeEnv = (typeof NODE_ENV_VALUES)[number]

const rawNodeEnv = parsedNodeEnv
if (!rawNodeEnv || !NODE_ENV_VALUES.includes(rawNodeEnv as NodeEnv)) {
  const msg = `❌ La variable NODE_ENV debe ser una de: ${NODE_ENV_VALUES.join(', ')}`
  console.error(msg)
  throw new Error(msg)
}
const NODE_ENV = rawNodeEnv as NodeEnv
internalLogger.env.info(`🧩 NODE_ENV detectado: ${NODE_ENV}`)

const IS_DEPLOY = isDeploy === 'true'
internalLogger.env.info(`🚀 Modo Deploy: ${IS_DEPLOY ? 'Activo' : 'Desactivado'}`)

// Paths de archivos de configuración
const baseConfigPath = path.resolve(`config.${NODE_ENV}.jsonc`)
const localConfigPath = path.resolve(`config.${NODE_ENV}.local.jsonc`)

let rawConfig: any = {}
const loadedPaths: string[] = []

if (IS_DEPLOY) {
  // Configuración desde variables de entorno
  rawConfig = { ...process.env }
  loadedPaths.push('process.env')
  internalLogger.env.info('✅ Configuración cargada desde variables de entorno (modo deploy)')
} else {
  if (fs.existsSync(baseConfigPath)) {
    rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(baseConfigPath, 'utf-8')))
    loadedPaths.push(baseConfigPath)
    internalLogger.env.info(`✅ Configuración cargada desde: ${baseConfigPath}`)
  }

  if (fs.existsSync(localConfigPath)) {
    const localConfig = JSON.parse(stripJsonComments(fs.readFileSync(localConfigPath, 'utf-8')))
    rawConfig = { ...rawConfig, ...localConfig }
    loadedPaths.push(localConfigPath)
    internalLogger.env.info(`✅ Configuración local sobreescrita desde: ${localConfigPath}`)
  }
}

if (loadedPaths.length === 0) {
  const msg = `❌ No se encontró ningún archivo de configuración válido (${baseConfigPath}, ${localConfigPath})`
  internalLogger.env.error(msg)
  throw new Error(msg)
}

// Boolean coercion helper
const booleanString = z
  .union([z.string(), z.boolean()])
  .transform((val) => {
    if (typeof val === 'string') {
      return val.trim().toLowerCase() === 'true'
    }
    return val === true
  })
  .pipe(z.boolean())

// Esquema de validación con Zod
const configSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV_VALUES).default(NODE_ENV),
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

  PG_BOSS_USER: z.string().nullish(),
  PG_BOSS_PASSWORD: z.string().nullish(),
  PG_BOSS_HOST: z.string().nullish(),
  PG_BOSS_PORT: z.string().nullish(),
  PG_BOSS_DB: z.string().nullish(),

  AUTH_PUBLIC_API_PASSWORD: z.string().nullish(),
  AUTH_PUBLIC_API_USERNAME: z.string().nullish(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),

  JWT_COOKIE_NAME: z.string(),

  NODE_TLS_REJECT_UNAUTHORIZED: z.coerce.number(),
})

// Validar y exportar configuración
export const appEnv = configSchema.parse(rawConfig)
internalLogger.env.info('✅ Configuración validada correctamente con zod')
internalLogger.env.info(`🔍 Configuración final`, appEnv)

// 🟢 Aquí arranca tu lógica principal (servidores, workers, etc.)
// import('./server') // ejemplo
