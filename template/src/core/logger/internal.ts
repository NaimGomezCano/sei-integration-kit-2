// src/logger/internal.ts

import { dispatchLog } from './dispatcher'
import { LogCategory, LogLevel } from './types'

type StandardLogFn = (message: string, metadata?: Record<string, any>) => void

type HttpLogFn = (data: { method: string; path: string; statusCode: number; durationMs: number; ip?: string; traceId?: string; userAgent?: string }) => void

function createStandardCategory(category: LogCategory) {
  const fn = (level: LogLevel): StandardLogFn => {
    return (message, metadata = {}) =>
      dispatchLog({
        level,
        category,
        message,
        metadata,
      })
  }

  return {
    debug: fn('debug'),
    info: fn('info'),
    warn: fn('warn'),
    error: fn('error'),
    critical: fn('critical'),
    metrics: fn('metrics'),
  }
}

function createApiCategory(): Record<'debug' | 'info' | 'warn' | 'error', HttpLogFn> {
  const fn = (level: LogLevel): HttpLogFn => {
    return (data) =>
      dispatchLog({
        level,
        category: 'api',
        message: `${data.method} ${data.path} -> ${data.statusCode}`,
        metadata: data,
      })
  }

  return {
    debug: fn('debug'),
    info: fn('info'),
    warn: fn('warn'),
    error: fn('error'),
  }
}

export const internalLogger = {
  env: createStandardCategory('env'),
  network: createStandardCategory('network'),
  sql: createStandardCategory('sql'),
  logger: createStandardCategory('logger'),
  core: createStandardCategory('core'),
  job: createStandardCategory('job'),
  decorator: createStandardCategory('decorator'),
  schedule: createStandardCategory('schedule'),
  otel: createStandardCategory('otel'),
  api: createApiCategory(),

  forCategory: (cat: string) => createStandardCategory(cat),
}
