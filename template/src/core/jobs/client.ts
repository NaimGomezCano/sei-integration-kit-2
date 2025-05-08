import { getEnvironment } from '@/shared/utils/getEnvironment'
import { context as otelContext, propagation } from '@opentelemetry/api'
import { CoreError } from '../errors/core.error'
import { boss } from './boss-instance'
import { clearJobError, getJobError } from './error-tracker'

export async function runJob<T = any>(queue: string, jobName: string, payload: { args: unknown[]; traceparent?: string }): Promise<T> {
  /* asegura traceparent */
  let traceparent = payload.traceparent
  if (!traceparent) {
    const carrier: Record<string, string> = {}
    propagation.inject(otelContext.active(), carrier)
    traceparent = carrier.traceparent
    if (!traceparent) throw new Error('[RunJob] No hay contexto OTEL activo')
  }

  const jobId = await boss.send(queue, { jobName, args: payload.args, traceparent })

  if (!jobId) {
    throw new CoreError(`[RunJob] ❌ No se pudo enviar el job "${queue}:${jobName}"`)
  }
  /* polling sencillo */
  const start = Date.now()
  const timeout = 120_000
  const isDev = getEnvironment().NODE_ENV === 'development'

  while (true) {
    const job: any = await boss.getJobById(queue, jobId, { includeArchive: true })

    if (job?.state === 'completed' && job.output) return (job.output as { result: T }).result

    if (job?.state === 'failed') {
      let err = getJobError(jobId)

      if (err) {
        throw err
      }

      if (job) {
        if (job.output) {
          err = new CoreError('Job failed -> ' + job.output.error)
        }
      }

      if (!err) {
        const message = 'Job failed'
        err = new CoreError(message)
      }

      clearJobError(jobId)

      // Lanza l error para que pueda ser manejado por quien llame esta función
      throw err
    }

    if (!isDev && Date.now() - start > timeout) {
      throw new CoreError(`[RunJob] Timeout esperando job ${queue}:${jobName}`)
    }
    await new Promise((r) => setTimeout(r, 300))
  }
}
