import { z } from 'zod'
import { OperationErrorSchema } from './operation-error.schema'

export const OperationCoreSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable(),
  error: OperationErrorSchema.nullable(),
})
