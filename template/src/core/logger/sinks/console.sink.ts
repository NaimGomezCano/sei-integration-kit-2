import chalk from 'chalk'
import * as clr from 'colorette'
import dayjs from 'dayjs'
import { colorize as jsonColorize } from 'json-colorizer'
import winston from 'winston'
import { LogEntryExtended } from '../types'

const customTheme = {
  Whitespace: clr.white,
  Colon: clr.white,
  Comma: clr.white,
  Brace: clr.white,
  Bracket: chalk.magenta,
  StringKey: clr.blue,
  StringLiteral: clr.green,
  NumberLiteral: chalk.hex('#FFA500'),
  BooleanLiteral: clr.yellow,
  NullLiteral: clr.gray,
} as const

// Colores por nivel
const levelColors: Record<string, (text: string) => string> = {
  error: clr.red,
  warn: clr.yellow,
  info: clr.green,
  debug: clr.cyan,
  verbose: clr.magenta,
  internal_error: clr.red,
  default: clr.white,
}

export const prettyFormat = winston.format.printf((info: winston.Logform.TransformableInfo) => {
  const logEntry = info as unknown as LogEntryExtended

  const timestamp = dayjs(logEntry.timestamp).isValid() ? dayjs(logEntry.timestamp).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss')

  const level = logEntry.level?.toLowerCase?.() ?? 'info'
  const category = (logEntry.category ?? 'general').toUpperCase()
  const tag = `[${category}-${level.toUpperCase()}]`
  const colorFn = levelColors[level] || levelColors.default
  const coloredTag = colorFn(tag)

  const traceId = typeof logEntry.traceId === 'string' ? logEntry.traceId.slice(0, 5) : '-----'
  const env = logEntry.environment === 'development' ? 'dev' : logEntry.environment === 'production' ? 'prod' : logEntry.environment ?? 'env'

  const message = logEntry.message ?? '[No message provided]'
  const meta = logEntry.metadata ?? {}

  let metaString = ''
  if (Object.keys(meta).length > 0) {
    try {
      if (typeof meta === 'object' && !(meta instanceof Error) && !(meta instanceof Date)) {
        metaString =
          '\n' +
          jsonColorize(meta, {
            colors: customTheme,
            indent: 2,
          })
        if (metaString.trim() === '{}') metaString = ''
      } else {
        metaString = ` | ${String(meta)}`
      }
    } catch {
      metaString = ' | [Unserializable metadata]'
    }
  }

  return `${env} | ${traceId} | ${timestamp} | ${coloredTag} | ${message}${metaString}`
})

export const consoleLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.timestamp(), prettyFormat),
  transports: [new winston.transports.Console()],
})

export function writeToConsole(payload: Partial<LogEntryExtended> & { message?: string; level?: string }) {
  const { message = '', level = 'info', ...rest } = payload
  consoleLogger.log(level, message, { ...rest })
}
