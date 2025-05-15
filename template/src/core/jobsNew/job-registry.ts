import pLimit from 'p-limit';

export interface JobDefinition {
  name: string;
  handler: (...args: any[]) => Promise<any> | any;
  concurrency: number;
  timeoutMs?: number;
  // Limiter de concurrencia para este job (se inicializa al registrar)
  limiter?: ReturnType<typeof pLimit>;
}

export const jobRegistry = new Map<string, JobDefinition>();

/**
 * Añade un job al registro global.
 * (Generalmente llamado desde el decorador @Job).
 */
export function registerJob(def: JobDefinition): void {
  // Crear un limitador de concurrencia p-limit para este job
  def.limiter = pLimit(def.concurrency);
  jobRegistry.set(def.name, def);
}
