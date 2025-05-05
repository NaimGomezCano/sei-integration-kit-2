import { z } from 'zod'

export function createZodModel<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  type Model = z.infer<T>
  type Draft = Partial<Model>

  return {
    schema,
    draftSchema: schema.partial(),
    Type: null as unknown as Model,
    Draft: null as unknown as Draft,
    validateDraft: (data: Draft): Model => schema.parse(data),
    safeParse: (data: unknown) => schema.safeParse(data),
    isValid: (data: unknown): data is Model => schema.safeParse(data).success,
  }
}
