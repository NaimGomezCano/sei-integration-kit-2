import { context as otelContext, trace } from '@opentelemetry/api'
import { runJob } from './client'
import { addJob, JobHandler } from './job-registry'

// -------------------- Tipos auxiliares --------------------
type JobMap = Record<string, JobHandler>

/** API que exponen los servicios al invocar `accountJobs.<fn>()` */
export type JobProxy<T extends JobMap> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => ReturnType<T[K]>
} & { registerWorker: () => JobProxy<T> }

/* Construye cabecera W3C traceparent desde el span activo */
function buildTraceParent(): string {
  const span = trace.getSpan(otelContext.active())
  if (!span) throw new Error('[OTEL] No hay span activo')
  const { traceId, spanId, traceFlags } = span.spanContext()
  const flags = (traceFlags & 1) === 1 ? '01' : '00'
  return `00-${traceId}-${spanId}-${flags}`
}

/**
 * Crea un JobProxy para una cola/worker:
 * 1. Registra el handler en `job-registry` (suscripción temprana).
 * 2. Devuelve proxies que publican el job en PgBoss con contexto OTEL.
 * 3. Inyecta `__jobMeta` (workerName + jobName) para el Scheduler.
 */
export function createJobProxy<T extends JobMap>(queue: string, definition: T): JobProxy<T> {
  const proxy = {} as Record<keyof T, any>

  for (const key of Object.keys(definition) as Array<keyof T>) {
    const handler = definition[key]

    // 1. Registro estático
    addJob(queue, key as string, handler)

    // 2. Función proxy que publica en PgBoss
    const fn = ((...args: any[]) =>
      runJob(queue, key as string, {
        args,
        traceparent: buildTraceParent(),
      })) as (typeof proxy)[typeof key]

    // 3. Metadata
    Object.defineProperty(fn, '__jobMeta', {
      value: { workerName: queue, jobName: key as string },
      enumerable: false,
    })

    proxy[key] = fn
  }

  // Método legacy (no-op)
  Object.defineProperty(proxy, 'registerWorker', {
    value: () => proxy,
    enumerable: false,
  })

  return proxy as JobProxy<T>
}
