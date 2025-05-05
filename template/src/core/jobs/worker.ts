import { context as otelContext, propagation, SpanStatusCode, trace } from '@opentelemetry/api'
import { internalLogger } from '../logger/internal'
import { boss } from './boss-instance'
import { trackJobError } from './error-tracker'
import { getAllJobs } from './job-registry'

// -------------------- Tipos auxiliares --------------------
export type WorkerDefinition = { [job: string]: (...a: any[]) => Promise<any> }
export type JobPayload = { jobName: string; args: unknown[]; traceparent: string }

/**
 * Inicia PgBoss y registra todos los handlers acumulados en `jobRegistry`
 * antes de permitir la publicación o ejecución de cronjobs.
 */
export async function startAllWorkers() {
  const allJobs = getAllJobs()
  if (allJobs.length === 0) {
    internalLogger.job.error('[startAllWorkers] ⚠️  No se encontraron jobs en el registry.')
  } else {
    internalLogger.job.info(`[startAllWorkers] Registrando ${allJobs.length} job(s): ${allJobs.map((j) => `${j.queue}:${j.name}`).join(', ')}`)
  }

  // 1. Construir un mapa queue -> handlers
  const workersByQueue = new Map<string, WorkerDefinition>()
  for (const { queue, name, handler } of allJobs) {
    if (!workersByQueue.has(queue)) workersByQueue.set(queue, {})
    workersByQueue.get(queue)![name] = handler
  }

  // 2. Suscribirse a cada cola
  for (const [queue, map] of workersByQueue.entries()) {
    await boss.createQueue(queue).catch(() => {})

    internalLogger.job.info(`Iniciando worker para cola "${queue}" con ${Object.keys(map).length} job(s): ${Object.keys(map).join(', ')}`)

    await boss.work(queue, { batchSize: 20 }, async (jobs) => {
      for (const job of jobs) {
        const { jobName, args, traceparent } = job.data as JobPayload
        const fn = map[jobName]

        internalLogger.job.info(`Ejecutando handler: queue="${queue}" jobName="${jobName}" id=${job.id}`)

        if (!fn) {
          internalLogger.job.error(`[Handler Missing] queue="${queue}" id=${job.id} jobName="${jobName}"`)
          await boss.fail(job.name, job.id, { error: 'Handler not found' })
          continue
        }
        if (!traceparent) {
          await boss.fail(job.name, job.id, { error: 'Missing trace context' })
          continue
        }

        const parentCtx = propagation.extract(otelContext.active(), { traceparent })
        const tracer = trace.getTracer('pg-boss')
        const span = tracer.startSpan(`${queue}:${jobName}`, { kind: 1 }, parentCtx)

        await otelContext.with(trace.setSpan(parentCtx, span), () => {
          // No uses 'await' aquí porque 'with' no maneja promesas correctamente
          return executeJob()
        })

        async function executeJob() {
          try {
            const res = await fn(...(args as any[]))
            await boss.complete(job.name, job.id, { result: res })
          } catch (err: any) {
            internalLogger.job.warn('Llamadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
            span.setStatus({ code: SpanStatusCode.ERROR, message: err?.message })
            trackJobError(job.id, err)
            await boss.fail(job.name, job.id, { error: err?.message })
          } finally {
            span.end()
          }
        }
      }
    })
  }
}
