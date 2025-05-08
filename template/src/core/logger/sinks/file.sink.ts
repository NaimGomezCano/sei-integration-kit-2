// src/logger/fileSink.ts
import fs from 'fs'
import path from 'path'
import winston from 'winston'
import 'winston-daily-rotate-file'

import { internalLogger } from '../internal'
import type { LogEntryApiExtendedTraceable, LogEntryStdExtendedTraceable } from '../types'
import { getEnvironment } from '@/shared/utils/getEnvironment'

const SINK_LOG_DIR = process.env.IS_DEPLOY ? path.resolve(process.env.DEPLOY_DIR!, 'logs') : path.resolve(process.cwd(), 'logs')

if (!fs.existsSync(SINK_LOG_DIR)) {
  fs.mkdirSync(SINK_LOG_DIR, { recursive: true })
  internalLogger.core.info(`[FileSink] Carpeta de logs creada: ${SINK_LOG_DIR}`)
}

const fileTransport = new winston.transports.DailyRotateFile({
  dirname: SINK_LOG_DIR,
  filename: '%DATE%.log', // p.ej. 2025‑05‑07.log
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '500m',
  zippedArchive: false,
  level: 'debug',
})

const jsonLineFormat = winston.format.printf((info) => {
  try {
    return JSON.stringify(info)
  } catch (err) {
    // Fallback: nunca perder la línea
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: getEnvironment().NODE_ENV,
      level: 'error',
      message: '[LOGGER_FORMAT_ERROR]',
      category: 'core',
      formatError: (err as Error).message,
    })
  }
})

const fileLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.uncolorize(), jsonLineFormat),
  transports: [fileTransport],
})

export function writeToFile(payload: LogEntryStdExtendedTraceable | LogEntryApiExtendedTraceable) {
  try {
    fileLogger.log(payload.level, '', payload)
  } catch (err) {
    internalLogger.core.error('[FileSink] Error al escribir log', {
      module: 'file.sink',
      error: { message: (err as Error).message, stack: (err as Error).stack },
    })
  }
}
