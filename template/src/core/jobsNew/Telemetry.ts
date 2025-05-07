// telemetry.ts
import {
  context,
  propagation,
  trace,
  Span,
  Context,
  SpanOptions,
  SpanKind,
  ROOT_CONTEXT,          // <- constante correcta
} from '@opentelemetry/api';

export namespace Telemetry {
  /** Devuelve el Contexto OTEL activo o null si no hay ninguno. */
  export function getCurrentContext(): Context | null {
    return context.active() ?? null;
  }

  /** Serializa un Context (por defecto, el activo) a la cabecera traceparent. */
  export function getTraceParentHeader(ctx: Context = context.active()): string {
    const span = trace.getSpan(ctx);
    if (!span) {
      throw new Error('[OTEL] No hay span activo para generar traceparent');
    }
    const carrier: Record<string, string> = {};
    propagation.inject(ctx, carrier);
    const traceparent = carrier['traceparent'];
    if (!traceparent) {
      throw new Error('[OTEL] No se pudo extraer traceparent del contexto');
    }
    return traceparent;
  }

  /** Reconstruye un Context OTEL a partir de traceparent (y opcionalmente tracestate). */
  export function extractContext(
    traceparent: string,
    tracestate?: string
  ): Context {
    const carrier: Record<string, string> = { traceparent };
    if (tracestate) carrier['tracestate'] = tracestate;
    return propagation.extract(ROOT_CONTEXT, carrier);  // <- se usa ROOT_CONTEXT
  }

  /** Ejecuta una función dentro de un Context OTEL y devuelve su resultado. */
  export function runWithContext<T>(
    ctx: Context,
    fn: () => Promise<T> | T
  ): Promise<T> {
    return context.with(ctx, () => Promise.resolve(fn()));
  }

  /**
   * Crea un span hijo dentro de parentCtx y ejecuta fn(span) en él.
   * El span se cierra automáticamente; se propaga cualquier error.
   */
  export async function runWithSpan<T>(
    parentCtx: Context,
    spanName: string,
    fn: (span: Span) => Promise<T> | T,
    spanOptions: SpanOptions = { kind: SpanKind.INTERNAL }
  ): Promise<T> {
    const tracer = trace.getTracer('job-tracer');
    const span = tracer.startSpan(spanName, spanOptions, parentCtx);
    try {
      const result = await context.with(
        trace.setSpan(parentCtx, span),
        () => fn(span)
      );
      span.setStatus({ code: 1 });
      return result;
    } catch (err: any) {
      span.setStatus({ code: 2, message: err?.message });
      throw err;
    } finally {
      span.end();
    }
  }
}
