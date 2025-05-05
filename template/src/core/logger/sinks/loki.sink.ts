// src/logger/sinks/loki.sink.ts

import axios from 'axios'
import { internalLogger } from '../internal'
import { markSinkFailed, shouldSkipSink } from './sinkStatus'

const LOKI_URL = process.env.LOKI_URL ?? ''
const ENABLED = process.env.LOG_TO_LOKI === 'true'
const ENV = process.env.NODE_ENV ?? 'development'

export async function writeToLoki(payload: any) {
  if (!ENABLED || !LOKI_URL) return
  if (shouldSkipSink('loki')) return

  try {
    const timeNano = BigInt(Date.now()) * 1_000_000n

    const logLine = JSON.stringify(payload)

    const body = {
      streams: [
        {
          stream: {
            level: payload.level,
            category: payload.category,
            env: ENV,
          },
          values: [[timeNano.toString(), logLine]],
        },
      ],
    }

    const result = await axios.post(`${LOKI_URL}/loki/api/v1/push`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    markSinkFailed('loki')

    internalLogger.core.error('[Loki] Error al enviar log', {
      module: 'loki.sink',
      error: {
        message: (err as Error).message,
        stack: (err as Error).stack,
      },
    })
  }
}
