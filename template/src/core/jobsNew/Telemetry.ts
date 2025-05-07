// Telemetry.ts
import { context, propagation } from '@opentelemetry/api';

/**
 * Obtiene el traceparent del contexto de OpenTelemetry actual.
 * @returns El string `traceparent` si hay un contexto activo; undefined si no.
 */
export function getCurrentTraceparent(): string | undefined {
  const carrier: Record<string, string> = {};
  // Inyecta el contexto actual en el carrier (incluye traceparent/tracestate)
  propagation.inject(context.active(), carrier);
  return carrier.traceparent;
}

/**
 * Ejecuta una función dentro de un contexto de OpenTelemetry restaurado a partir de un traceparent.
 * Garantiza que cualquier operación de tracing dentro de fn se encadenará a la traza original.
 * @param traceparent Valor de la cabecera traceparent a extraer.
 * @param fn Función (sin argumentos) que se ejecutará dentro del contexto extraído.
 */
export function runWithContext<T>(traceparent: string, fn: () => T): T {
  const carrier = { traceparent };
  // Extraer el contexto propagado desde el carrier
  const newContext = propagation.extract(context.active(), carrier);
  // Ejecutar la función dentro de ese contexto
  return context.with(newContext, fn);
}
