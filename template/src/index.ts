import 'dotenv/config'
import 'source-map-support/register'
import { internalLogger } from './core/logger/internal'

internalLogger.core.info('ea')

import './__auto_imports__'

import { serve } from '@hono/node-server'
import { appEnv } from './appEnv'
import { runPendingSchedules } from './core/croner/croner-scheduler'
import { boss } from './core/jobs/boss-instance'
import { startAllWorkers } from './core/jobs/worker'
import { logger } from './core/logger'
import { initializeTelemetry } from './core/otel/initialize-telemetry'
import openAPIHono from './core/public-api'
import { getAppWelcomeInfo } from './shared/utils/global'

async function bootstrap() {
  try {
    logger.info('Starting Application...')

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

/*;import { JobManager } from './core/jobsNew/job-manager'
(async () => {
  // Inicializar PgBoss (usar cadena de conexión apropiada)
  const boss = new PgBoss(`postgres://${appEnv.PG_BOSS_USER}:${appEnv.PG_BOSS_PASSWORD}@${appEnv.PG_BOSS_HOST}:${appEnv.PG_BOSS_PORT}/${appEnv.PG_BOSS_DB}`)
  await boss.start()

  // Inicializar el gestor de jobs y lanzar los workers
  const jobManager = new JobManager(boss)
  await jobManager.startAllWorkers()
  console.log('Workers iniciados. Esperando ejecución de jobs...')

  // Simular un contexto OTEL activo antes de disparar un job (normalmente ya existiría si está instrumentado)

  const span = trace.getTracer('default').startSpan('demo-span')
  await context.with(trace.setSpan(context.active(), span), async () => {
    try {
      // Trigger del job "processData"
      const result = await jobManager.trigger('processData', 7)
      console.log(`Resultado del job: ${result}`) // Debería imprimir 49
    } catch (err) {
      console.error('Error en job:', err)
    } finally {
      span.end()
    }
  })

  await boss.stop()
})()

*/
