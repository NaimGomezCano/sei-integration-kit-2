// JobDecorator.ts
type JobOptions = { concurrency?: number; timeoutMs?: number };

interface JobDefinition {
  name: string;
  handler: (...args: any[]) => Promise<any>;
  concurrency: number;
  timeoutMs?: number;
}

// Registro global de jobs decorados
export const jobsRegistry: Map<string, JobDefinition> = new Map();

/**
 * Decorador @Job para registrar una función asíncrona como un job de pg-boss.
 * @param name Nombre del job/cola (debe ser único). Si se omite, se usa el nombre de la función.
 * @param options Opciones opcionales: concurrencia y timeout.
 */
export function Job(name?: string, options?: JobOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>
  ) {
    const jobName = name ?? propertyKey;
    const handlerFn = descriptor.value;
    if (!handlerFn) {
      throw new Error(`@Job decorator must be used on an async function`);
    }
    // Determinar opciones con valores por defecto
    const concurrency = options?.concurrency ?? 5;
    const timeoutMs = options?.timeoutMs;  // undefined representa sin límite
    // Registrar la definición del job
    jobsRegistry.set(jobName, { name: jobName, handler: handlerFn, concurrency, timeoutMs });
  };
}
