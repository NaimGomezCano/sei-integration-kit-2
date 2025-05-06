import { z } from '@hono/zod-openapi'

export const ReportParamsSchema = z.object({
  error: z.boolean(),
  resultSet: z.array(
    z.object({
      parameterType: z.string(),
      values: z.array(z.string()),
      defaultValuesDescription: z.object({}),
      length: z.string(),
      isOptionalPrompt: z.string(),
      description: z.string(),
      allowNullValue: z.string(),
      isShownOnPanel: z.string(),
      type: z.string(),
      editMask: z.string(),
      minimumValue: z.string(),
      initialValues: z.array(z.string()),
      isEditableOnPanel: z.string(),
      valueRangeKind: z.string(),
      allowMultiValue: z.string(),
      name: z.string(),
      defaultValues: z.array(z.string()),
      currentvalues: z.array(z.string()),
      maximumValue: z.string(),
      allowCustomCurrentValues: z.string(),
    })
  ),
})

export type ReportParams = z.infer<typeof ReportParamsSchema>
