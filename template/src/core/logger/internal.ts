// src/logger/internal.ts

import { dispatchLog } from './dispatcher'
import { LogCategory, LogEntryApi, LogLevel } from './types'

type StandardLogFn = (message: string, metadata?: Record<string, any>) => void

type HttpInfoRequestFn = (data: {
  method: string
  path: string
  statusCode: number
  durationMs: number
  ip: string
  userAgent: string
  requestBody?: any
  responseBody?: any
  traceId?: string
}) => void

function createApiCategory() {
  const fn = (level: LogLevel): StandardLogFn => {
    return (message, metadata = {}) =>
      dispatchLog({
        level,
        category: LogCategory.API,
        message,
        metadata,
      })
  }

  const infoRequest = (data: LogEntryApi) => {
    dispatchLog({
      level: 'info',
      category: LogCategory.API,
      ...data,
    })
  }

  const errorRequest = (data: LogEntryApi) => {
    dispatchLog({
      level: 'error',
      category: LogCategory.API,
      ...data,
    })
  }

  return {
    debug: fn('debug'),
    info: fn('info'),
    warn: fn('warn'),
    error: fn('error'),
    infoRequest,
    errorRequest,
  }
}

function createStdCategory(category: LogCategory) {
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

export const internalLogger = {
  env: createStdCategory(LogCategory.Env),
  network: createStdCategory(LogCategory.Network),
  sql: createStdCategory(LogCategory.SQL),
  logger: createStdCategory(LogCategory.Logger),
  core: createStdCategory(LogCategory.Core),
  job: createStdCategory(LogCategory.Job),
  decorator: createStdCategory(LogCategory.Decorator),
  schedule: createStdCategory(LogCategory.Schedule),
  otel: createStdCategory(LogCategory.OTel),
  api: createApiCategory(),

  //forCategory: (cat: string) => createStdCategory(cat),
}
