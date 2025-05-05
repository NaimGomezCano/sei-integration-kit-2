import { z } from 'zod'
import { OperationCoreSchema } from './schemas/operation-core.schema'
import { OperationResultSchema } from './schemas/operation-result.schema'

// 👇 Tipo completo del resultado (con meta, results, etc.)
export type OperationResult<T = unknown> = z.infer<typeof OperationResultSchema> & { data: T | null }

// 👇 Tipo base para elementos individuales (como en results[])
export type OperationCoreResult = z.infer<typeof OperationCoreSchema>

// 👇 Tipo parcial (útil para drafts)
export type OperationResultDraft = Partial<OperationResult>

// 👇 Alias útil para crear helpers con datos tipados
export type OperationSuccess<T = unknown> = Omit<OperationResult, 'data' | 'success' | 'error'> & {
  success: true
  data: T
  error: null
}

export type OperationError = Omit<OperationResult, 'data' | 'success' | 'error'> & {
  success: false
  data: null
  error: {
    name: string
    issue: {
      code: string
      message: string
      path: (string | number)[]
    }
  }
}
