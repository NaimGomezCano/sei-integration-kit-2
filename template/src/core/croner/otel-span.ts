import { context as otelContext, SpanContext, trace } from '@opentelemetry/api'

/**
 * Ejecuta una función dentro de un span y adjunta traceId en caso de error.
 */
export async function runInSpan<T>(spanName: string, fn: () => Promise<T> | T, attributes?: Record<string, string>): Promise<{ result: T; traceId: string }> {
  const tracer = trace.getTracer('scheduler')
  const span = tracer.startSpan(spanName)
  const ctx = trace.setSpan(otelContext.active(), span)

  return await otelContext.with(ctx, async () => {
    try {
      const result = await fn()

      if (attributes) {
        for (const [k, v] of Object.entries(attributes)) {
          span.setAttribute(k, v)
        }
      }

      return {
        result,
        traceId: span.spanContext().traceId,
      }
    } catch (err) {
      const traceId = span.spanContext().traceId
      span.recordException(err as Error)

      // Attach traceId to the error safely
      if (typeof err === 'object' && err !== null) {
        Object.defineProperty(err, '__traceId', {
          value: traceId,
          writable: false,
          enumerable: false,
        })
      }

      throw err
    } finally {
      span.end()
    }
  })
}

/**
 * Permite recrear un contexto a partir de un traceId (fuera del contexto original).
 */
export function restoreContextFromTraceId(traceId: string) {
  const tracer = trace.getTracer('manual')

  const dummySpanContext: SpanContext = {
    traceId,
    spanId: '0000000000000001',
    traceFlags: 1,
    isRemote: false,
  }

  const dummySpan = trace.wrapSpanContext(dummySpanContext)

  return otelContext.with(trace.setSpan(otelContext.active(), dummySpan), () => {})
}
