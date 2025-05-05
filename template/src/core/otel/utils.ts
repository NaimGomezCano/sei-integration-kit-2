import { context, trace } from '@opentelemetry/api'

export function getCurrentTraceId(): string | undefined {
  const span = trace.getSpan(context.active())
  return span?.spanContext().traceId
}

export function getCurrentSpanId(): string | undefined {
  const activeSpan = trace.getSpan(context.active())
  return activeSpan?.spanContext().spanId
}
