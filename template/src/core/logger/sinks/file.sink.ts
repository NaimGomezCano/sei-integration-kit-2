import winston from 'winston'
import 'winston-daily-rotate-file'
import { internalLogger } from '../internal'
import { markSinkFailed, shouldSkipSink } from './sinkStatus'
import { LogCategory, LogEntryBase, LogLevel } from '../types'

/*──────────────────────── VARIABLES DE ENTORNO ────────────────────────*/
const {
  LOG_TO_FILE,
  LOG_DIR = 'logs',
  NODE_ENV = 'development',
} = process.env

/*──────────────────────── NIVELES PERMITIDOS ──────────────────────────*/
const LEVELS: readonly LogLevel[] = [
  'debug',
  'info',
  'warn',
  'error',
  'critical',
  'metrics',
] as const

const isValidLevel = (lvl: string): lvl is LogLevel =>
  (LEVELS as readonly string[]).includes(lvl)

/*──────────────────────── TRANSPORTE ROTATIVO ─────────────────────────*/
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '500m',
  zippedArchive: true,
  level: 'debug',
})

/*──────────────────────── FORMATO JSON LINES ──────────────────────────*/
const jsonLineFormat = winston.format.printf((info) => {
  try {
    /* 1. Normalizamos y tipamos */
    const level: LogLevel = isValidLevel(info.level) ? info.level : 'info'
    const category: LogCategory =
      (info as any).category ?? ('core' as LogCategory)

    const message: string =
      typeof info.message === 'string'
        ? info.message
        : info.message !== undefined
        ? JSON.stringify(info.message)
        : ''

    /* 2. Construimos el objeto que SATISFACE LogEntryBase */
    const base: LogEntryBase & { timestamp: string; environment: string } = {
      level,
      message,
      category,
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    }

    /* 3. Mezclamos metadatos (“aplanamos”) */
    if ((info as any).metadata) {
      Object.assign(base, (info as any).metadata)
    }

    return JSON.stringify(base) + '\n'
  } catch (err) {
    /* 🔴 Fallback SIEMPRE serializa algo legible por Promtail */
    return (
      JSON.stringify({
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        level: 'error',
        message: '[LOGGER_FORMAT_ERROR]',
        category: 'core',
        formatError: (err as Error).message,
      }) + '\n'
    )
  }
})

/*──────────────────────── LOGGER FINAL ────────────────────────────────*/
const fileLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.uncolorize(), jsonLineFormat),
  transports: [fileTransport],
})

/*──────────────────────── API PARA TU APP ─────────────────────────────*/
export function writeToFile(payload: any) {
  if (LOG_TO_FILE !== 'true') return
  if (shouldSkipSink('file')) return

  try {
    const lvl: LogLevel = isValidLevel(payload.level) ? payload.level : 'info'
    fileLogger.log(lvl, payload.message ?? '', payload)
  } catch (err) {
    markSinkFailed('file')
    internalLogger.core.error('[File] Error al escribir log', {
      module: 'file.sink',
      error: { message: (err as Error).message, stack: (err as Error).stack },
    })
  }
}
