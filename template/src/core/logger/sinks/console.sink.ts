// src/logger/sinks/console.sink.ts
import chalk from 'chalk'
import * as clr from 'colorette'
import dayjs from 'dayjs'
import { colorize as jsonColorize } from 'json-colorizer'
import winston from 'winston'

import { LogCategory, LogEntryApiExtendedTraceable, LogEntryStdExtendedTraceable } from '../types'

/* ---------- Colores JSON ---------- */
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

/* ---------- Colores por nivel ---------- */
const levelColors: Record<string, (txt: string) => string> = {
  error: clr.red,
  warn: clr.yellow,
  info: clr.green,
  debug: clr.cyan,
  verbose: clr.magenta,
  internal_error: clr.red,
  default: clr.white,
}

/* ---------- PARTE COMÚN ---------- */
type CommonParts = {
  timestampFmt: string
  coloredTag: string
  env: string
  traceIdShort: string
  level: string
}

function buildCommonParts(info: LogEntryStdExtendedTraceable): CommonParts {
  const timestampFmt = dayjs(info.timestamp).isValid() ? dayjs(info.timestamp).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss')

  const level = info.level?.toLowerCase?.() ?? 'info'
  const category = (info.category ?? 'general').toUpperCase()
  const tag = `[${category}-${level.toUpperCase()}]`
  const coloredTag = (levelColors[level] || levelColors.default)(tag)

  const traceIdShort = typeof info.traceId === 'string' ? info.traceId.slice(0, 5) : '-----'

  const env = info.environment === 'development' ? 'dev' : info.environment === 'production' ? 'prod' : info.environment ?? 'env'

  return { timestampFmt, coloredTag, env, traceIdShort, level }
}

/* ---------- RENDER PARA LOG ESTÁNDAR ---------- */
function renderStd(entry: LogEntryStdExtendedTraceable, common: CommonParts): string {
  const { timestampFmt, coloredTag, env, traceIdShort } = common
  const message = entry.message?.replace(/^\s+/, '') || '[No message provided]'

  const meta = entry.metadata ?? {}

  let metaString = ''
  if (Object.keys(meta).length) {
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

  return `${env} | ${traceIdShort} | ${timestampFmt} | ${coloredTag} | ${message}${metaString}`
}

/* ---------- RENDER PARA LOG API ---------- */
function renderApi(entry: LogEntryApiExtendedTraceable, common: CommonParts): string {
  const { timestampFmt, coloredTag, env, traceIdShort } = common

  const { method, path, statusCode, durationMs, ip, userAgent, requestBody, responseBody } = entry

  const requestStr = `${method} ${path}`
  const statusStr = `${statusCode} (${durationMs} ms)`
  const metaStr =
    '\n' +
    jsonColorize(
      {
        ip,
        ua: userAgent,
        body: requestBody,
        response: responseBody,
      },
      { colors: customTheme, indent: 2 }
    )

  return `${env} | ${traceIdShort} | ${timestampFmt} | ${coloredTag} | ${requestStr} → ${statusStr}${metaStr}`
}

/* ---------- FORMAT WINSTON ---------- */
const prettyFormat = winston.format.printf((raw) => {
  // `raw` es `TransformableInfo`; lo tratamos como los tipos extendidos
  //const base = raw as LogEntryStdExtendedTraceable
  const common = buildCommonParts(raw as unknown as LogEntryStdExtendedTraceable)

  if (raw.category === LogCategory.API) {
    return renderApi(raw as unknown as LogEntryApiExtendedTraceable, common)
  }

  // default = STD
  return renderStd(raw as unknown as LogEntryStdExtendedTraceable, common)
})

/* ---------- LOGGER ---------- */
export const consoleLogger = winston.createLogger({
  level: process.env.CONSOLE_LOG_LEVEL,
  format: winston.format.combine(winston.format.timestamp(), prettyFormat),
  transports: [new winston.transports.Console()],
})

/* ---------- writeToConsole ---------- */
export function writeToConsole(payload: LogEntryStdExtendedTraceable | LogEntryApiExtendedTraceable) {
  // Winston necesita un nivel y un mensaje; aquí delegamos en el formatter
  consoleLogger.log(payload.level, '', payload)
}
