// src/logger/fileSink.ts
import winston from 'winston'
import 'winston-daily-rotate-file'
import { internalLogger } from '../internal'
import { LogLevel } from '../types'
import { markSinkFailed, shouldSkipSink } from './sinkStatus'

function isValidLevel(level: any): level is LogLevel {
  return ['debug', 'info', 'warn', 'error', 'critical', 'metrics'].includes(level)
}

function safeToString(data: unknown): string {
  try {
    return JSON.stringify(data)
  } catch {
    return '[Unserializable log object]'
  }
}

// 👉 1.  Variables de entorno reutilizables
const {
  LOG_TO_FILE,
  LOG_DIR = 'logs',
  NODE_ENV = 'development', // se enviará como label “environment”
} = process.env

// 👉 2.  Rotación: mismo patrón, pero con extensión fija y compresión opcional
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: '%DATE%.log', // p.ej. 2025‑05‑07.log
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '500m',
  zippedArchive: true, // ahorra espacio y no rompe promtail
  level: 'debug',
})

// 👉 3.  Formato: JSON plano + \n (Promtail necesita “JSON Lines”)
const jsonLineFormat = winston.format.printf((info) => {
  try {
    const base = {
      level: isValidLevel(info.level) ? info.level : 'info',
      message: typeof info.message === 'string' ? info.message : JSON.stringify(info.message),
      category: typeof info.category === 'string' ? info.category : 'core',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      ...(info.metadata ?? {}),
    }

    return `${JSON.stringify(base)}\n`
  } catch (err) {
    // Fallback: log de error si falla el formateo principal
    const fallback = {
      level: 'error',
      message: '[Logger] Error al formatear log',
      category: 'core',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      originalError: (err as Error).message,
      raw: safeToString(info),
    }

    return `${JSON.stringify(fallback)}\n`
  }
})

const fileLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.uncolorize(), // evita códigos ANSI
    jsonLineFormat
  ),
  transports: [fileTransport],
})

export function writeToFile(payload: any) {
  if (LOG_TO_FILE !== 'true') return
  if (shouldSkipSink('file')) return

  try {
    const level = payload.level || 'info'
    fileLogger.log(level, payload.message || '', payload)
  } catch (err) {
    markSinkFailed('file')
    internalLogger.core.error('[File] Error al escribir log', {
      module: 'file.sink',
      error: { message: (err as Error).message, stack: (err as Error).stack },
    })
  }
}
