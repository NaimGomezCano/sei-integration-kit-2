// src/logger/fileSink.ts
import fs from 'fs'
import path from 'path'
import winston from 'winston'
import 'winston-daily-rotate-file'

import { internalLogger } from '../internal'
import type { LogCategory, LogEntryBase, LogLevel } from '../types'
import { markSinkFailed, shouldSkipSink } from './sinkStatus'

/*─────────────────────── CONSTANTES A PARTIR DE appEnv ───────────────────────*/

/** Carpeta de destino según modo deploy */
const LOG_DIR = process.env.IS_DEPLOY ? path.resolve(process.env.DEPLOY_DIR!, 'logs') : path.resolve(process.cwd(), 'logs')

/** Asegúrate de que existe */
if (process.env.LOG_TO_FILE && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
  internalLogger.core.info(`[FileSink] Carpeta de logs creada: ${LOG_DIR}`)
}

/*──────────────────────── NIVELES PERMITIDOS ─────────────────────────*/
const LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical', 'metrics'] as const

const isValidLevel = (lvl: string): lvl is LogLevel => (LEVELS as readonly string[]).includes(lvl)

/*──────────────────────── TRANSPORTE ROTATIVO ────────────────────────*/
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: LOG_DIR,
  filename: '%DATE%.log', // p.ej. 2025‑05‑07.log
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '500m',
  zippedArchive: true,
  level: 'debug',
})

/*──────────────────────── FORMATO JSON LINES ─────────────────────────*/
const jsonLineFormat = winston.format.printf((info) => {
  try {
    const level: LogLevel = isValidLevel(info.level) ? info.level : 'info'
    const category: LogCategory = (info as any).category ?? 'core'

    const message = typeof info.message === 'string' ? info.message : info.message !== undefined ? JSON.stringify(info.message) : ''

    const base: LogEntryBase & { timestamp: string; environment: string } = {
      level,
      message,
      category,
      timestamp: new Date().toISOString(), // RFC3339Nano
      environment: process.env.NODE_ENV!,
    }

    if ((info as any).metadata) {
      Object.assign(base, (info as any).metadata)
    }

    return JSON.stringify(base)
  } catch (err) {
    // Fallback: nunca perder la línea
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV!,
      level: 'error',
      message: '[LOGGER_FORMAT_ERROR]',
      category: 'core',
      formatError: (err as Error).message,
    })
  }
})

/*──────────────────────── LOGGER PRINCIPAL ──────────────────────────*/
const fileLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.uncolorize(), jsonLineFormat),
  transports: [fileTransport],
})

/*──────────────────────── FUNCIÓN PÚBLICA ────────────────────────────*/
export function writeToFile(payload: any) {
  if (!process.env.LOG_TO_FILE!) return
  if (shouldSkipSink('file')) return

  try {
    const lvl: LogLevel = isValidLevel(payload.level) ? payload.level : 'info'
    fileLogger.log(lvl, payload.message ?? '', payload)
  } catch (err) {
    markSinkFailed('file')
    internalLogger.core.error('[FileSink] Error al escribir log', {
      module: 'file.sink',
      error: { message: (err as Error).message, stack: (err as Error).stack },
    })
  }
}
