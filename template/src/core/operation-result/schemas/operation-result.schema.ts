import { createZodModel } from '@/shared/utils/create-model'
import { z } from 'zod'
import { OperationCoreSchema } from './operation-core.schema'

export const OperationResultSchema = OperationCoreSchema.extend({
  meta: z.object({
    summary: z
      .object({
        total: z.number(),
        successCount: z.number(),
        errorCount: z.number(),
      })
      .nullable(),

    results: z.array(OperationCoreSchema).nullable(), // subresultados

    pagination: z
      .object({
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
      })
      .nullable(),

    durationMs: z.number().nullable(),
    traceId: z.string().nullish(),
    timestamp: z.string().nullable(),
    warnings: z.array(z.string()).nullable(),
    tags: z.array(z.string()).nullable(),

    raw: z.unknown().nullable(),
  }),
})

export const OperationResult = createZodModel(OperationResultSchema)
