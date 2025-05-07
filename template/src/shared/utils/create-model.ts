import { z } from 'zod'

/**
 * Devuelve una copia profunda del objeto/array sin las claves cuyo
 * valor sea `undefined`.  Mantiene `null`, 0, '', false, etc.
 */
export function pruneUndefined<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map(pruneUndefined) as unknown as T
  }
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val)
        .filter(([, v]) => v !== undefined) // ⬅️  sólo undefined
        .map(([k, v]) => [k, pruneUndefined(v)])
    ) as unknown as T
  }
  return val
}

export function createZodModel<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  type Model = z.infer<T>
  type Draft = Partial<Model>

  /* factor común: limpia antes de validar */
  function clean<D>(data: D): D {
    return pruneUndefined(data)
  }

  return {
    schema,
    draftSchema: schema.partial(),

    Type: null as unknown as Model,
    Draft: null as unknown as Draft,

    /* –––––––– sin limpiar (legacy) ––––––– */
    validateDraft: (d: Draft): Model => schema.parse(d),
    safeParse: (d: unknown) => schema.safeParse(d),
    isValid: (d: unknown): d is Model => schema.safeParse(d).success,

    /* –––––––– CON limpieza (recomendado) ––––––– */
    validateCleanDraft: (d: Draft): Model => schema.parse(clean(d) as Draft),

    safeParseClean: (d: unknown) => schema.safeParse(clean(d as Draft)),

    isValidClean: (d: unknown): d is Model => schema.safeParse(clean(d as Draft)).success,
  }
}
