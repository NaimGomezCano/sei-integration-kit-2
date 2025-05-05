// src/logger/dispatcher.ts

import { getCurrentSpanId, getCurrentTraceId } from '../otel/utils'
import { writeToConsole } from './sinks/console.sink'
import { writeToFile } from './sinks/file.sink'
import { writeToLoki } from './sinks/loki.sink'
import { LogEntryBase, LogEntryExtended } from './types'

export function dispatchLog(entry: LogEntryBase) {
  const traceId = getCurrentTraceId() ?? '################################'
  const spanId = getCurrentSpanId() ?? '################################'
  const timestamp = new Date().toISOString()
  const environment = process.env.NODE_ENV ?? 'unknown'

  const payload: LogEntryExtended = {
    ...entry,
    environment: environment,
    traceId: traceId,
    spanId: spanId,
    timestamp: timestamp,
  }

  writeToConsole(payload)
  writeToFile(payload)
  writeToLoki(payload)
}
