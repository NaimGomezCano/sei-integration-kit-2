import { internalLogger } from '../logger/internal'

/**
 * Decorador que ejecuta automáticamente scheduleJobs() al importar la clase.
 */
export function RegisterSchedules(): ClassDecorator {
  return function (target: any) {
    try {
      const instance = new target()

      if (typeof instance.scheduleJobs !== 'function') {
        throw new Error(`La clase ${target.name} no implementa scheduleJobs()`)
      }

      internalLogger.decorator.info(`[RegisterSchedules] Ejecutando scheduleJobs() de ${target.name}`)
      instance.scheduleJobs()
    } catch (err) {
      internalLogger.decorator.error(`[RegisterSchedules] Error en ${target.name}`, { err })
    }
  }
}
