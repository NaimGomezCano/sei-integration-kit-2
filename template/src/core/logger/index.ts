// src/logger/index.ts

import { dispatchLog } from './dispatcher'

export const logger = {
  debug: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'debug', category: 'app', message: msg, metadata }),
  info: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'info', category: 'app', message: msg, metadata }),
  warn: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'warn', category: 'app', message: msg, metadata }),
  error: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'error', category: 'app', message: msg, metadata }),
  critical: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'critical', category: 'app', message: msg, metadata }),
  metrics: (msg: string, metadata?: Record<string, any>) => dispatchLog({ level: 'metrics', category: 'app', message: msg, metadata }),
}
