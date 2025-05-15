import { context, propagation, trace } from '@opentelemetry/api'
import pTimeout from 'p-timeout'
import PgBoss from 'pg-boss'
import { JobDefinition, jobRegistry } from './job-registry'
import { ErrorTracker } from './error-tracker'

export class JobManager {
  private boss: PgBoss
  // Mapa interno de promesas pendientes: jobId -> { resolve, reject }
  private pendingJobs = new Map<string, { resolve: Function; reject: Function }>()

  constructor(boss: PgBoss) {
    this.boss = boss
  }

  /**
   * Inicia un job de manera asíncrona y espera su resultado.
   * @param jobName Nombre del job (cola) a ejecutar.
   * @param args Argumentos que se pasarán al job.
   * @returns Resultado devuelto por el job, o lanza el error original si falló.
   */
  async trigger(jobName: string, ...args: any[]): Promise<any> {
    // 1. Verificar contexto activo de OpenTelemetry y extraer traceparent
    const activeSpan = trace.getActiveSpan()
    if (!activeSpan) {
      throw new Error('No hay un contexto de OpenTelemetry activo (traceparent requerido)')
    }
    // Usar propagación W3C para obtener el header traceparent del contexto actual
    const carrier: Record<string, string> = {}
    propagation.inject(context.active(), carrier, {
      set: (c, key, val) => {
        c[key] = String(val)
      },
    })
    const traceparent = carrier['traceparent']
    if (!traceparent) {
      throw new Error('No se pudo obtener traceparent del contexto OTEL activo')
    }

    // 2. Publicar el job en PgBoss, adjuntando traceparent y argumentos
    const jobData = { traceparent, args }
    const jobId = await this.boss.send(jobName, jobData)
    if (!jobId) {
      throw new Error(`No se pudo enviar el job '${jobName}' a la cola`)
    }

    // Preparar una promesa para esperar el resultado del job
    const jobPromise = new Promise<any>((resolve, reject) => {
      this.pendingJobs.set(jobId, { resolve, reject })
    })

    // 3. (Monolítico) Esperar resultado del job resolviendo la promesa vinculada
    // NOTA: En un entorno distribuido, se haría polling con boss.getJobById():contentReference[oaicite:0]{index=0},
    // pero aquí usamos la comunicación en memoria.
    let result
    try {
      // 4. Esperar la resolución (o error) con un posible timeout global
      result = await jobPromise
    } catch (err) {
      // Si el job lanzó un error, remover de pendingJobs y propagar el error original
      this.pendingJobs.delete(jobId)
      throw err // Propaga exactamente el error original (misma instancia)
    }
    // Remover de pendingJobs (ya resuelto correctamente)
    this.pendingJobs.delete(jobId)
    return result
  }

  /**
   * Registra workers para todos los jobs en el registro global.
   * Debe llamarse una vez al inicio para comenzar a procesar jobs.
   */
  async startAllWorkers(): Promise<void> {
    // Asegurarse de crear las colas en PgBoss para cada job registrado
    for (const jobDef of jobRegistry.values()) {
      await this.boss.createQueue(jobDef.name)
    }
    // Iniciar un worker por cada tipo de job registrado
    for (const jobDef of jobRegistry.values()) {
      const { name } = jobDef
      // Crear el worker con PgBoss
      this.boss.work(name, async (job) => {
        // Usar el runner de ejecución para manejar concurrencia, timeout y errores
        return this.executeJob(jobDef, job)
      })
    }
  }

  /**
   * Lógica interna para ejecutar un job cuando es consumido por un worker.
   * Controla concurrencia, contexto de trace, timeout y propagación de errores.
   */
  private async executeJob(
  jobDef: JobDefinition,
  job: any
): Promise<any> {
  const { id: jobId, data } = job;
  const { traceparent, args } = data;

  /* 👇 1. Validación estricta */
  if (!traceparent) {
    const err = new Error(`[${jobDef.name}] Falta traceparent en el mensaje`);
    ErrorTracker.track(jobId, err);        // Registramos el error
    if (this.pendingJobs.has(jobId)) {
      this.pendingJobs.get(jobId)!.reject(err); // Propagamos al caller
    }
    throw err;                             // PgBoss marcará el job como failed
  }

  /* 👇 2. Reconstruimos contexto y ejecutamos handler */
  const carrier = { traceparent };
  const getter = {
    get: (c: Record<string, string>, key: string) => c[key],
    keys: (c: Record<string, string>) => Object.keys(c),
  };
  const parentCtx = propagation.extract(context.active(), carrier, getter);

  const runHandler = async () => jobDef.handler(...args);

  try {
    const result = await jobDef.limiter!(
      () =>
        jobDef.timeoutMs != null
          ? pTimeout(runHandler(), jobDef.timeoutMs, () => {
              throw new Error(
                `Timeout de ${jobDef.timeoutMs} ms excedido en job ${jobDef.name}`
              );
            })
          : runHandler()
    );
    /* resolvemos al caller… */
    this.pendingJobs.get(jobId)!.resolve(result);
    return result;
  } catch (error) {
    ErrorTracker.track(jobId, error);
    this.pendingJobs.get(jobId)!.reject(error);
    throw error;
  }
}

}
