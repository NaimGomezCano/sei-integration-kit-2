import { z } from 'zod'
import { OperationCoreSchema } from './schemas/operation-core.schema'
import { OperationResultSchema } from './schemas/operation-result.schema'
import { OperationResult } from './types'
import { safeRemoveNulls } from './utils/safe-remove-nulls.util'

const RAW_EXCLUDED_FIELDS = ['_sessionCache'] // TODO: parametrizar

function filterRaw(raw: any, excludedFields: string[]): any {
  if (!raw || typeof raw !== 'object') return raw

  if (Array.isArray(raw)) {
    return raw.map((item) => filterRaw(item, excludedFields))
  }

  return Object.keys(raw).reduce((acc, key) => {
    if (excludedFields.includes(key)) return acc

    acc[key] = filterRaw(raw[key], excludedFields)
    return acc
  }, {} as any)
}

/**
 * Tipos derivados del esquema Zod
 */
type Core = z.infer<typeof OperationCoreSchema>
type Meta = z.infer<typeof OperationResultSchema>['meta']

/**
 * Builder para construir respuestas estándar de la aplicación
 */
export class OperationResultBuilder<T = unknown> {
  private readonly result: {
    success: boolean
    data: T | null
    error: Core['error']
    meta: Meta
  }

  private constructor(initial: Partial<Core> = {}) {
    this.result = {
      success: initial.success ?? true,
      data: (initial.data as T | null) ?? null,
      error: initial.error ?? null,
      meta: {
        summary: null,
        results: null,
        pagination: null,
        durationMs: null,
        traceId: null,
        timestamp: new Date().toISOString(),
        warnings: null,
        tags: null,
        raw: null, // Nuevo campo para raw
      },
    }
  }

  /**
   * Constructor estático para resultado exitoso
   */
  static success<T = unknown>(data?: T): OperationResultBuilder<T> {
    return new OperationResultBuilder<T>({
      success: true,
      data,
    })
  }

  /**
   * Constructor estático para resultado con error
   */
  static error(name: string, code: string, message: string, path?: any[]): OperationResultBuilder<null> {
    // TODO: Quitar path poner data
    return new OperationResultBuilder<null>({
      success: false,
      error: {
        name,
        issue: { code, message, path },
      },
    })
  }

  /**
   * Añadir raw contextual a meta
   */
  addRaw(raw: unknown): OperationResultBuilder<T> {
    //this.result.meta.raw = filterRaw(raw, RAW_EXCLUDED_FIELDS)
    this.result.meta.raw = raw
    return this
  }

  /**
   * Añadir metadatos al resultado
   */
  withMeta(meta: Partial<Meta>): OperationResultBuilder<T> {
    this.result.meta = {
      ...this.result.meta,
      ...meta,
    }
    return this
  }

  /**
   * Añadir un resultado individual al array meta.results
   */
  addResult(result: Core): OperationResultBuilder<T> {
    this.result.meta.results ??= []
    this.result.meta.results.push(result)
    return this
  }

  /**
   * Genera el objeto final validado
   */
  build(options?: { includeNulls?: boolean }): OperationResult<T> {
    OperationResultSchema.parse(this.result)

    if (options?.includeNulls) {
      return this.result
    }

    return safeRemoveNulls(this.result) as OperationResult<T>
  }
}
