// src/logger/dispatcher.ts

import { getCurrentSpanId, getCurrentTraceId } from '../otel/utils'
import { writeToConsole } from './sinks/console.sink'
import { writeToFile } from './sinks/file.sink'
import { LogCategory, LogEntryApiExtended, LogEntryApiExtendedTraceable, LogEntryStdExtended, LogEntryStdExtendedTraceable } from './types'

function getCommonMetadata() {
  return {
    traceId: getCurrentTraceId() ?? '################################',
    spanId: getCurrentSpanId() ?? '################################',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'unknown',
  }
}

function buildApiPayload(entry: LogEntryApiExtended): LogEntryApiExtendedTraceable {
  return {
    ...entry,
    ...getCommonMetadata(),
  }
}

function buildStdPayload(entry: LogEntryStdExtended): LogEntryStdExtendedTraceable {
  return {
    ...entry,
    ...getCommonMetadata(),
  }
}

export function dispatchLog(entry: LogEntryStdExtended | LogEntryApiExtended) {
  // ⇣ la unión que realmente vas a manejar
  let payload: LogEntryStdExtendedTraceable | LogEntryApiExtendedTraceable

  switch (entry.category) {
    case LogCategory.API:
      payload = buildApiPayload(entry as LogEntryApiExtended)
      break

    default:
      payload = buildStdPayload(entry as LogEntryStdExtended)
      break
  }

  writeToConsole(payload)
  writeToFile(payload)
}
