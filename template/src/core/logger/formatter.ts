// src/logger/formatter.ts

/*import { getOtelCurrentTraceId } from '../otel/utils'
import { LogEntryBase } from './types'

export function formatLog(entry: LogEntryBase): any {
  const traceId = getOtelCurrentTraceId() ?? '################################'
  const timestamp = new Date().toISOString()

  const { category, message, metadata, traceId, ...rest } = entry

  const baseFormatted = {
    traceId: traceId ?? null,
    ...rest,
    category,
    message,
    metadata: { ...metadata },
  }

  switch (category) {
    case 'core':
    case 'domain':
    default:
      return baseFormatted
  }
}
*/