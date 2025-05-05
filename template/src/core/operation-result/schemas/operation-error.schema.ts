import { z } from 'zod'

export const OperationErrorSchema = z.object({
  name: z.string(),
  issue: z.object({
    code: z.string(),
    message: z.string(),
    path: z.array(z.any()).nullish(),
  }),
})
