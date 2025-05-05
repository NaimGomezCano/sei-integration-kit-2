import { context as otelContext, trace } from '@opentelemetry/api'
import { Cron, CronOptions } from 'croner'
import { handleErrorToOperationResult } from '../error-handling/handle-error'
import { CoreError } from '../errors/core.error'
import { internalLogger } from '../logger/internal'

/**
 * Helper to pause execution for a given amount of milliseconds.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

interface ScheduleParams<Args extends any[] = any[]> {
  job: (...a: Args) => Promise<any> | any
  cron: string
  args?: Args
  /**
   * Standard Croner options **plus** an optional `maxUndefinedRetries` to tweak
   * how many times we should re‐run a job that returns `undefined`.
   */
  options?: Omit<CronOptions, 'catch' | 'paused'> & {
    /** overrides the default 5 retries for `undefined` results */
    maxUndefinedRetries?: number
  }
  /**
   * Whether the job should be triggered immediately on boot.
   */
  runOnInit?: boolean
}

type JobMeta = { workerName?: string; jobName?: string }
const pendingSchedules: Cron[] = []

export function schedule<Args extends any[] = any[]>({ job, cron, args = [] as unknown as Args, runOnInit = false, options = {} }: ScheduleParams<Args>): Cron {
  const { workerName = 'unknown-worker', jobName = job.name } = ((job as any).__jobMeta as JobMeta) ?? {}
  const {
    maxUndefinedRetries = 5, // keep previous behaviour unless overridden
    ...cronerOptions
  } = options

  internalLogger.schedule.info(`[Scheduler] Preparando job → worker="${workerName}", name="${jobName}", expr="${cron}"`)

  const tracer = trace.getTracer('scheduler')

  const task = new Cron(cron, { unref: true, ...cronerOptions }, async () => {
    const span = tracer.startSpan(`${workerName}:${jobName}`, {
      attributes: { 'job.worker': workerName, 'job.name': jobName, 'job.runOn': cron },
    })
    const ctx = trace.setSpan(otelContext.active(), span)
    const traceId = span.spanContext().traceId
    const started = Date.now()

    internalLogger.schedule.info(`⏳ Starting ${workerName}:${jobName}`)

    try {
      while (true) {
        const result = await otelContext.with(ctx, () => job(...args))

        if (result === undefined) {
          throw new CoreError(`${workerName}:${jobName} returned undefined`)
        }

        internalLogger.schedule.info(`[Scheduler] ✅ Completed ${workerName}:${jobName}`, {
          ms: Date.now() - started,
          traceId,
          result,
        })
        return result
      }
    } catch (err) {
      // Attach traceId for downstream handlers
      if (typeof err === 'object' && err) {
        Object.defineProperty(err, '__traceId', { value: traceId, enumerable: false })
      }

      otelContext.with(ctx, () => {
        const errorResult = handleErrorToOperationResult(err)
        internalLogger.schedule.error(`[Scheduler] ❌ ${workerName}:${jobName}`, {
          errorResult,
        })
      })
    } finally {
      span.end()
    }
  })

  if (runOnInit) pendingSchedules.push(task)
  return task
}

export function runPendingSchedules() {
  internalLogger.schedule.info(`[Scheduler] 🚀 runOnInit → ${pendingSchedules.length}`)
  pendingSchedules.forEach((t) => t.trigger())
  pendingSchedules.length = 0
}
