import pTimeout from 'p-timeout';
import { propagation, context, TextMapGetter } from '@opentelemetry/api';
import { ErrorTracker } from './error-tracker';
import type { JobDefinition } from './job-registry';
import type PgBoss from 'pg-boss';

export async function runJob(
  jobDef: JobDefinition,
  job: { id: string; data: any },           // evitamos tipos rotos de pg-boss
  pendingResolve: (v: any) => void,
  pendingReject: (e: any) => void
): Promise<any> {
  const { id: jobId, data } = job;
  const { traceparent, args } = data;

  /* 1️⃣  Validación: traceparent es obligatorio */
  if (!traceparent) {
    const err = new Error(`[${jobDef.name}] Falta traceparent en el mensaje`);
    ErrorTracker.track(jobId, err);
    pendingReject(err);
    throw err;               // PgBoss marcará el job como failed
  }

  /* 2️⃣  Reconstruimos el contexto OTEL */
  const carrier = { traceparent };

  const getter: TextMapGetter<Record<string, string>> = {
    get: (c, key) => c[key],
    keys: (c) => Object.keys(c),
  };

  const parentCtx = propagation.extract(context.active(), carrier, getter);

  /* 3️⃣  Función real a ejecutar (respetando limit y timeout) */
  const executeHandler = () =>
    jobDef.limiter!(async () => await jobDef.handler(...args));

  try {
    // Ejecutar dentro del contexto OTEL restaurado
    const resultPromise = context.with(parentCtx, executeHandler);

    const result =
      jobDef.timeoutMs != null
        ? await pTimeout(resultPromise, jobDef.timeoutMs, () => {
            throw new Error(
              `Timeout de ${jobDef.timeoutMs} ms excedido en job ${jobDef.name}`
            );
          })
        : await resultPromise;

    pendingResolve(result);      // despierta al caller
    return result;               // PgBoss => completed
  } catch (err) {
    ErrorTracker.track(jobId, err);
    pendingReject(err);          // caller recibe MISMA instancia de error
    throw err;                   // PgBoss => failed
  }
}