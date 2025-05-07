import winston from 'winston'
import 'winston-daily-rotate-file'
import { internalLogger } from '../internal'
import { markSinkFailed, shouldSkipSink } from './sinkStatus'

const fileTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '500m',
  zippedArchive: false,
  level: 'debug',
})

const fileLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => JSON.stringify(info) + '\n') // 👈 fuerza salto de línea
  ),
  transports: [fileTransport],
})

export function writeToFile(payload: any) {
  if (process.env.LOG_TO_FILE !== 'true') {
    return
  }
  if (shouldSkipSink('file')) return

  try {
    const level = payload.level || 'info'
    fileLogger.log(level, payload.message || '', payload)
  } catch (err) {
    markSinkFailed('file')

    internalLogger.core.error('[File] Error al escribir log', {
      module: 'file.sink',
      error: {
        message: (err as Error).message,
        stack: (err as Error).stack,
      },
    })
  }
}
