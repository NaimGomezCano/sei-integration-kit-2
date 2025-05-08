// utils/getEnvironment.ts
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

export const VALID_ENVS = ['development', 'test', 'production'] as const
export type NodeEnv = (typeof VALID_ENVS)[number]

export interface EnvironmentInfo {
  NODE_ENV: NodeEnv
  IS_DEPLOY: boolean
}

let cache: EnvironmentInfo | null = null

export function getEnvironment(): EnvironmentInfo {
  if (cache) return cache // Evitar recalcular en futuras llamadas

  // 1️⃣  Analizar argumentos de línea de comandos
  const envArg = process.argv.find((arg) => arg.startsWith('--env='))?.split('=')[1]
  const deployFlag = process.argv.includes('--deploy=true')

  // 2️⃣  Determinar si estamos en despliegue
  const IS_DEPLOY = deployFlag || process.env.IS_DEPLOY === 'true'

  // 3️⃣  Cargar el fichero .env adecuado (si existe)
  const envFile = IS_DEPLOY ? '.env.deploy' : '.env'
  const envPath = path.resolve(process.cwd(), envFile)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }

  // 4️⃣  Resolver y validar NODE_ENV
  const rawNodeEnv = envArg ?? process.env.NODE_ENV
  if (!rawNodeEnv || !VALID_ENVS.includes(rawNodeEnv as NodeEnv)) {
    throw new Error(`NODE_ENV debe ser uno de: ${VALID_ENVS.join(', ')}`)
  }
  const NODE_ENV = rawNodeEnv as NodeEnv

  // 5️⃣  Propagar para el resto de la aplicación

  //ts-ignore
  process.env.NODE_ENV = NODE_ENV
  process.env.IS_DEPLOY = IS_DEPLOY ? 'true' : 'false'

  cache = { NODE_ENV, IS_DEPLOY }
  return cache
}
