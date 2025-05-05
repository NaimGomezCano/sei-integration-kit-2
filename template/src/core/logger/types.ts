// src/logger/types.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical' | 'metrics'

export type LogCategory = 'core' | 'domain' | string

/*export interface LogEntryBase {
  traceId?: string
  level: LogLevel
  message: string
  category: LogCategory
  timestamp?: string // ISO string
  metadata?: Record<string, any>
}*/

export interface LogEntryBase {
  level: LogLevel
  message: string,
  category: LogCategory
  metadata?: Record<string, any>
}

export interface LogEntryExtended extends LogEntryBase {
  environment: string
  spanId: string
  traceId: string
  timestamp: string
}
