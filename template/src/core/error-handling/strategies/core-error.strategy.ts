import { ApiError } from '@/core/errors/api.error'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { RegisterErrorStrategy } from '../decorators'
import { ErrorLayer } from '../layers'
import { ErrorStrategy } from '../types'

@RegisterErrorStrategy('application')
export class CoreErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'domain'

  canHandle(error: unknown): boolean {
    return error instanceof ApiError
  }

  format(error: ApiError): OperationResultBuilder<null> {
    return OperationResultBuilder.error(error.name, error.code, error.message, error.path)
  }
}
