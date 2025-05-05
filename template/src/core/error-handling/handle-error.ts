import { OperationResultBuilder } from '../operation-result/operation-result.builder'
import { OperationResult } from '../operation-result/types'
import { getCurrentTraceId } from '../otel/utils'
import { getErrorStrategies } from './error-strategy-registry'

// Maneja la lógica de `canHandle` para cada estrategia con un `try-catch`
function handleCanHandle(strategy: any, error: unknown): boolean {
  try {
    return strategy.canHandle(error)
  } catch (err) {
    console.error('Error en canHandle:', err)
    return false
  }
}

// Maneja la lógica de `format` con un `try-catch` para asegurar que no falle
function handleFormat(strategy: any, error: unknown, opts: any): OperationResult {
  try {
    const traceId: string | undefined = getCurrentTraceId()

    return strategy
      .format(error)
      .addRaw(error) // error original
      .withMeta({
        traceId: traceId,
        timestamp: new Date().toISOString(),
      })
      .build({ includeNulls: opts?.includeNulls })
  } catch (err) {
    console.error('Error en el formato:', err)
    return OperationResultBuilder.error('FormatError', 'format_error', 'Error al procesar el formato del error')
      .addRaw({
        originalError: error,
        formattingError: err,
      }) // incluimos ambos errores
      .withMeta({
        traceId: getCurrentTraceId(),
        timestamp: new Date().toISOString(),
      })
      .build({ includeNulls: opts?.includeNulls })
  }
}

// Fallback en caso de que no se haya podido manejar el error
function handleFallback(error: unknown, opts?: { traceId?: string; includeNulls?: boolean }): OperationResult {
  try {
    return OperationResultBuilder.error('InternalServerError', 'internal_error', (error as Error)?.message || 'Unknown error')
      .addRaw(error)
      .withMeta({
        traceId: getCurrentTraceId(),
        timestamp: new Date().toISOString(),
      })
      .build({ includeNulls: opts?.includeNulls })
  } catch (err) {
    console.error('Error en el fallback de manejo de errores:', err)
    return OperationResultBuilder.error('FallbackError', 'fallback_error', 'Error desconocido durante el manejo del error, revisa el raw')
      .addRaw({
        originalError: error,
        fallbackError: err,
      }) // también aquí, registramos ambos
      .withMeta({
        traceId: getCurrentTraceId(),
        timestamp: new Date().toISOString(),
      })
      .build({ includeNulls: opts?.includeNulls })
  }
}

// Función principal para manejar el error
export function handleErrorToOperationResult(error: unknown, opts?: { traceId?: string; includeNulls?: boolean }): OperationResult {
  for (const strategy of getErrorStrategies()) {
    if (handleCanHandle(strategy, error)) {
      return handleFormat(strategy, error, opts)
    }
  }
  return handleFallback(error, opts)
}
