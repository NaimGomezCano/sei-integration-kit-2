import { internalLogger } from '../internal'

const failedSinks = new Set<string>()

export function markSinkFailed(sink: string) {
  if (!failedSinks.has(sink)) {
    failedSinks.add(sink)

    // Emitimos aviso a los demás sinks (usamos logger genérico para evitar loops)
    internalLogger.logger.warn(`⚠️ Sink "${sink}" falló y ha sido desactivado temporalmente`, {
      system: 'logger',
    })
  }
}

export function shouldSkipSink(sink: string): boolean {
  return failedSinks.has(sink)
}

export function resetSinkStatus(sink?: string) {
  if (sink) {
    failedSinks.delete(sink)
    internalLogger.logger.info(`✅ Sink "${sink}" ha sido reactivado`, {
      system: 'logger',
    })
  } else {
    failedSinks.clear()
    internalLogger.logger.info('✅ Todos los sinks han sido reactivados', {
      system: 'logger',
    })
  }
}

export function getSinkStatus(): Record<string, boolean> {
  return {
    file: !failedSinks.has('file'),
    loki: !failedSinks.has('loki'),
    postgres: !failedSinks.has('postgres'),
  }
}
