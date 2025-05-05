import { z } from '@hono/zod-openapi'

export const BasicAuthResponseSchema = z.object({
  message: z.string(),
  username: z.string(),
})

export const BasicAuthErrorResponseSchema = z.object({
  error: z.string(),
})
