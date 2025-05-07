import 'dotenv/config'
import 'source-map-support/register'

import './__auto_imports__'

import { serve } from '@hono/node-server'
import { appEnv } from './appEnv'
import { runPendingSchedules } from './core/croner/croner-scheduler'
import { boss } from './core/jobs/boss-instance'
import { startAllWorkers } from './core/jobs/worker'
import { logger } from './core/logger'
import { internalLogger } from './core/logger/internal'
import { initializeTelemetry } from './core/otel/initialize-telemetry'
import openAPIHono from './core/public-api'
import { getAppWelcomeInfo } from './shared/utils/global'

async function bootstrap() {
  try {
    const usuario: {
      id: number
      nombre: string
      correo: string
      edad: number
      activo: boolean
      direccion: {
        calle: string
        ciudad: string
        pais: string
      }
      intereses: string[]
    } = {
      id: 1,
      nombre: 'María González',
      correo: 'maria.gonzalez@example.com',
      edad: 29,
      activo: true,
      direccion: {
        calle: 'Calle Falsa 123',
        ciudad: 'Madrid',
        pais: 'España',
      },
      intereses: ['lectura', 'viajes', 'tecnología'],
    }

    internalLogger.core.info('Starting Application...', usuario)
    logger.info('Starting Application...', usuario)

    // 1. Inicializar Telemetría
    await initializeTelemetry()

    // 2. Iniciar PgBoss
    await boss.start()
    logger.info('Boss started')

    internalLogger.core.info('[Bootstrap] 🚀 Lanzando pending schedules...')
    runPendingSchedules()
    await startAllWorkers()

    serve(
      {
        fetch: openAPIHono.fetch,
        port: appEnv.APP_PORT,
      },
      async (info: any) => {
        internalLogger.core.info(`NGOMEZ Server is running on http://localhost:${info.port}`)
      }
    )

    // 7. Mensaje de bienvenida
    const welcomeInfo = getAppWelcomeInfo()
    internalLogger.core.info('******************************************************')
    internalLogger.core.info('Application Details ->', welcomeInfo)
    internalLogger.core.info('******************************************************')
    internalLogger.core.info('Application Started! 🚀 ')

    // 8. Escuchar errores de boss
    boss.on('error', (err) => {
      internalLogger.job.error('[Boss] Error:', { err })
    })
    boss.on('monitor-states', (states) => {
      internalLogger.job.info('[Boss States]', { states })
    })
  } catch (err) {
    internalLogger.core.error('[App] ❌ Error during bootstrap:', { err })
    process.exit(1)
  }
}

bootstrap()
