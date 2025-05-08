export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical' | 'metrics'

export const LogCategory = {
  Core: 'core',
  Domain: 'domain',
  Env: 'env',
  Network: 'network',
  SQL: 'sql',
  Logger: 'logger',
  Job: 'job',
  Decorator: 'decorator',
  Schedule: 'schedule',
  OTel: 'otel',
  API: 'api',
  App: 'app',
} as const

export type LogCategory = typeof LogCategory[keyof typeof LogCategory]

export interface LogEntryBase {
  level: LogLevel
  category: LogCategory
}

export interface TraceableEnriched {
  environment: string
  spanId: string
  traceId: string
  timestamp: string
}

////////////////

// Log general

export interface LogEntryStd {
  message: string
  metadata?: Record<string, any>
}

export interface LogEntryStdExtended extends LogEntryStd, LogEntryBase {}
export interface LogEntryStdExtendedTraceable extends LogEntryStdExtended, TraceableEnriched {}

/// Log para API

export interface LogEntryApi {
  method: string
  path: string
  statusCode: number
  durationMs: number
  ip: string
  userAgent: string
  requestBody?: any
  responseBody?: any
}

export interface LogEntryApiExtended extends LogEntryApi, LogEntryBase {}
export interface LogEntryApiExtendedTraceable extends LogEntryApiExtended, TraceableEnriched {}
