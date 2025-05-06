import { z } from '@hono/zod-openapi'

export const ExportPDFBodySchema = z.array(
  z.object({
    name: z.string(),
    type: z.string(),
    value: z.array(z.array(z.string())),
  })
)

export type ExportPDFBody = z.infer<typeof ExportPDFBodySchema>
