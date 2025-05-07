// JobDecorator.ts

interface JobDefinition {
  name: string
  handler: (...args: any[]) => Promise<any>
}

const jobRegistry: JobDefinition[] = []

/**
 * Decorador de función para registrar un job.
 * @param name Nombre único del job (cola en pg-boss).
 */
export function Job(name: string) {
  return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>) {
    const originalMethod = descriptor.value!
    // Registrar la definición del job en un registro global
    jobRegistry.push({ name, handler: originalMethod })
    // Opcional: marcar con Reflect metadata si se desea (requiere "reflect-metadata").
    // Reflect.defineMetadata('job:name', name, target, propertyKey);
  }
}

// Función para obtener todos los jobs registrados (usada por JobManager)
export function getRegisteredJobs(): JobDefinition[] {
  return jobRegistry
}
