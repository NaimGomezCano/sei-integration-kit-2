import { z } from '@hono/zod-openapi'

export const ReportListSchema = z.object({
  result: z.string(),
  resultSet: z.array(
    z.object({
      code: z.string(),
      root_name: z.string(),
      name: z.string(),
      root_guid: z.string(),
    })
  ),
})

export type ReportList = z.infer<typeof ReportListSchema>
