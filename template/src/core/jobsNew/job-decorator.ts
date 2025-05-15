import { JobDefinition, jobRegistry } from './job-registry'

interface JobOptions {
  concurrency?: number
  timeoutMs?: number
}

/**
 * Decorador para registrar una función como job.
 * @param name Nombre único del job (cola en PgBoss).
 * @param options Opciones de concurrencia y timeout.
 */
export function Job(name: string, options: JobOptions = {}) {
  return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    const originalFn = descriptor.value
    if (typeof originalFn !== 'function') {
      throw new Error('@Job must decorate a function method')
    }

    // Determinar nivel de concurrencia (por defecto 1 si no se especifica)
    const concurrency = options.concurrency ?? 1
    // Determinar timeout máximo (undefined o null significa sin límite)
    const timeoutMs = options.timeoutMs

    // Envolver la función original para mantener el contexto correcto (especialmente si es método estático)
    const jobHandler =
      target instanceof Function
        ? originalFn.bind(target) // Static method: bind to class (allows using 'this' as class if needed)
        : originalFn.bind(null) // Instance method or standalone function

    // Registrar en el registro global de jobs
    const jobDef: JobDefinition = { name, handler: jobHandler, concurrency, timeoutMs }
    jobRegistry.set(name, jobDef)
  }
}
