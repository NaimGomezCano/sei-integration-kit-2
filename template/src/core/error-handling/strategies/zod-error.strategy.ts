import { ErrorNames } from '@/core/errors/error-names'
import { ZodError } from 'zod'
import { OperationResultBuilder } from '../../operation-result/operation-result.builder'
import { RegisterErrorStrategy } from '../decorators'
import { ErrorLayer } from '../layers'
import { ErrorStrategy } from '../types'

interface ZodIssue {
  code: string
  expected?: string
  received?: string
  path: (string | number)[]
  message: string
}

@RegisterErrorStrategy('domain')
export class ZodErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'domain'

  canHandle(error: unknown): boolean {
    if (error instanceof ZodError) {
      const zodError = error as ZodError
      return zodError.name.includes('ZodError')
    }

    return false
  }

  format(error: ZodError): OperationResultBuilder<null> {
    const issue = error.issues[0]

    if (!issue) {
      return OperationResultBuilder.error('ZodError', 'validation_unknown', 'Error de validación desconocido', ['validation', 'zod'])
    }

    const path = issue.path.join('.') || 'unknown_field'
    const message = `${path}: ${issue.message}`

    return OperationResultBuilder.error(ErrorNames.Zod, `zod_${issue.code}`, message, [path])
  }
}
