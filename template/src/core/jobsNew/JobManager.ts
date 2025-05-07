// core/JobManager.ts
// ------------------------------------------------------------
// Gestor central de jobs para el framework.
//  • Descubre los jobs decorados (@Job)
//  • Crea una cola y un worker dedicado por job
//  • Propaga el contexto OpenTelemetry
//  • Permite invocar los jobs de forma síncrona mediante trigger()
// ------------------------------------------------------------

import PgBoss, {
  Job as BossJob,
  WorkOptions as BossWorkOptions,
  ConstructorOptions as BossConfig,
} from 'pg-boss';
import { Telemetry } from './Telemetry';
import { getRegisteredJobs } from './JobDecorator';

type JobPayload = { traceparent: string; args: unknown[] };

interface PendingRecord {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}

export class JobManager {
  private boss: PgBoss;
  private ready = false;
  /** Promesas en espera del resultado de cada jobId */
  private pendings = new Map<string, PendingRecord>();

  /** Configura pg‑boss y (opcionalmente) opciones por defecto para los workers */
  constructor(
    bossConfig: BossConfig,
    private defaultWorkerOptions: BossWorkOptions = { teamConcurrency: 10 }
  ) {
    this.boss = new PgBoss(bossConfig);
    this.boss.on('error', (err) => console.error('[PgBoss]', err));
  }

  // ----------------------------------------------------------
  //  Inicialización: arranca pg‑boss y registra los workers
  // ----------------------------------------------------------
  async start(): Promise<void> {
    if (this.ready) return;

    await this.boss.start();
    const jobs = getRegisteredJobs();

    if (jobs.length === 0) {
      console.warn('[JobManager] ⚠️  No se encontraron jobs registrados.');
    }

    for (const { name, handler, options } of jobs) {
      const queue = name; // Cola = nombre del job

      // Asegura que la cola exista (idempotente)
      await this.boss.createQueue(queue).catch(() => {});

      // Worker dedicado
      const workOptions: BossWorkOptions = {
        ...this.defaultWorkerOptions,
        ...options, // (si el decorador soporta opciones personalizadas)
      };

      await this.boss.work<JobPayload>(
        queue,
        workOptions,
        async (job: BossJob<JobPayload>) => {
          const { traceparent, args } = job.data;

          // ---- Validación del contexto de trazado ----
          if (!traceparent) {
            const err = new Error('Falta traceparent: contexto obligatorio');
            this.rejectJob(job.id, err);
            throw err; // pg‑boss marcará el job como failed
          }

          // ---- Ejecutar con contexto OTEL ----
          const parentCtx = Telemetry.extractContext(traceparent);
          return Telemetry.runWithContext(parentCtx, async () => {
            try {
              const result = await (handler as any)(...(args || []));
              this.resolveJob(job.id, result);
              return result; // se almacena en completed
            } catch (err) {
              this.rejectJob(job.id, err);
              throw err; // vuelve a pg‑boss → estado failed
            }
          });
        }
      );

      console.log(`✔️  Job "${name}" registrado (cola "${queue}")`);
    }

    this.ready = true;
  }

  // ----------------------------------------------------------
  //  Invoca un job y espera su resultado (síncrono para el caller)
  // ----------------------------------------------------------
  async trigger<Args extends unknown[], R>(
    jobName: string,
    ...args: Args
  ): Promise<R> {
    if (!this.ready) {
      throw new Error('JobManager no iniciado: llama a start() antes de usar');
    }

    // Verifica contexto OTEL activo
    const ctx = Telemetry.getCurrentContext();
    if (!ctx) {
      throw new Error(
        'No hay contexto OpenTelemetry activo (traceparent es obligatorio)'
      );
    }

    const traceparent = Telemetry.getTraceParentHeader(ctx);
    const jobId = await this.boss.send(jobName, { traceparent, args });

    // Crea la promesa que se resolverá desde el worker
    return new Promise<R>((resolve, reject) => {
      this.pendings.set(jobId, { resolve, reject });
    });
  }

  // ----------------------------------------------------------
  //  Helpers internos para resolver / rechazar jobs en espera
  // ----------------------------------------------------------
  private resolveJob(jobId: string, value: unknown) {
    const pending = this.pendings.get(jobId);
    if (pending) {
      pending.resolve(value);
      this.pendings.delete(jobId);
    }
  }

  private rejectJob(jobId: string, reason: any) {
    const pending = this.pendings.get(jobId);
    if (pending) {
      pending.reject(reason);
      this.pendings.delete(jobId);
    }
  }
}

/* -----------------------------------------------------------------
   Ejemplo de inicialización en tu punto de arranque de la app:

   import { JobManager } from './core/JobManager';
   import './jobs/EmailJobs';   // importa módulos con @Job
   import './jobs/DataJobs';

   const jobManager = new JobManager({ connectionString: process.env.DATABASE_URL });
   await jobManager.start();

   // Luego en cualquier parte:
   const resultado = await jobManager.trigger('send-welcome-email', userId);
------------------------------------------------------------------ */
