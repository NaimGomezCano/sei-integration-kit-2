// JobManager.ts
import PgBoss from 'pg-boss';
import pLimit from 'p-limit';
import { jobsRegistry } from './JobDecorator';
import { getCurrentTraceparent, runWithContext } from './Telemetry';

// Inicializar pg-boss (usar la URL de conexión o config según entorno)
const boss = new PgBoss(process.env.PGBOSS_DATABASE_URL || /* cadena de conexión */);
 
// Mapa para rastrear promesas pendientes de jobs lanzados: jobId -> resolvers
const pendingPromises: Map<string, { resolve: Function; reject: Function }> = new Map();

/**
 * Inicia los workers para todos los jobs registrados con @Job.
 * Debe llamarse una vez al arrancar la aplicación.
 */
export async function startJobWorkers(): Promise<void> {
  await boss.start();  // inicia la conexión y prepara las tablas de pg-boss

  for (const [jobName, jobDef] of jobsRegistry) {
    const { handler, concurrency, timeoutMs } = jobDef;

    // Crear limitador de concurrencia para este job
    const limit = pLimit(concurrency);

    // Suscribir un worker a la cola del job en pg-boss
    await boss.subscribe(jobName, { teamSize: 1, teamConcurrency: concurrency }, async (job) => {
      // El payload del job incluye los argumentos originales y el traceparent
      const { traceparent, args } = job.data;
      // Ejecutar el handler con p-limit (respeta concurrencia máxima)
      return limit(async () => {
        // Dentro de limit, extraemos el contexto de traceparent y ejecutamos el handler en él
        const execPromise = runWithContext(traceparent, () => handler(...args));
        // Si hay timeout configurado, aplicarlo
        const resultPromise = timeoutMs 
          ? applyTimeout(execPromise, timeoutMs) 
          : execPromise;
        // Esperar y retornar el resultado (o que lance si hay error/timeout)
        return await resultPromise;
      });
    });

    // Suscribir a eventos de finalización de esta cola para obtener resultado/error
    await boss.onComplete(jobName, (completion) => {
      const originalJobId = completion.data.request.id;    // id del job original
      const state = completion.data.state;                 // estado final: 'completed', 'failed', etc.
      const pending = pendingPromises.get(originalJobId);  // promesa esperando resultado
      if (!pending) return;  // podría no existir si no se lanzó via trigger
      if (state === 'completed') {
        // Tomar el resultado devuelto por el handler del job
        const result = completion.data.response?.value;
        pending.resolve(result);
      } else if (state === 'failed') {
        // Tomar información de error y rechazar la promesa con el mismo mensaje
        const errorInfo = completion.data.response?.error || completion.data.response;
        const errorMessage = (typeof errorInfo === 'string')
          ? errorInfo 
          : (errorInfo && errorInfo.message) || 'Job failed';
        pending.reject(new Error(errorMessage));
      } else {
        // Otros estados como 'expired' (timeout global de pg-boss) u 'expired'/'cancelled'
        pending.reject(new Error(`Job "${jobName}" terminó con estado ${state}`));
      }
      pendingPromises.delete(originalJobId);
    });
  }
}

/**
 * Aplica un timeout a una promesa, rechazándola si excede el tiempo dado.
 * @param promise Promesa original a vigilar.
 * @param timeoutMs Tiempo máximo en milisegundos.
 */
function applyTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Job timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Dispara un job por nombre con los argumentos dados, retornando una promesa con su resultado.
 * Debe existir un contexto de OpenTelemetry activo (traceparent) para propagar.
 * @param jobName Nombre del job (cola) a ejecutar.
 * @param args Parámetros que acepta el handler del job.
 * @returns Promesa que se resuelve con el resultado del job, o se rechaza con el error lanzado en el job.
 */
export async function trigger<ResultType = any>(jobName: string, ...args: any[]): Promise<ResultType> {
  // Verificar contexto de trace (traceparent obligatorio)
  const traceparent = getCurrentTraceparent();
  if (!traceparent) {
    throw new Error('No hay contexto de OpenTelemetry activo (traceparent es obligatorio)');
  }
  // Verificar que el job exista en el registro
  if (!jobsRegistry.has(jobName)) {
    throw new Error(`No existe ningún job registrado con el nombre "${jobName}"`);
  }
  // Encolar el job en pg-boss con sus datos (args + traceparent)
  const jobId = await boss.publish(jobName, { args, traceparent });
  // Devolver una promesa que se resolverá cuando llegue el evento de finalización
  return new Promise((resolve, reject) => {
    if (jobId) {
      pendingPromises.set(jobId, { resolve, reject });
    } else {
      reject(new Error(`Failed to publish job "${jobName}"`));
    }
  });
}
