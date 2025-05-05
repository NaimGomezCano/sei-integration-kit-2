import { DomainError } from '@/core/errors/domain.error'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { RegisterErrorStrategy } from '../decorators'
import { ErrorLayer } from '../layers'
import { ErrorStrategy } from '../types'

@RegisterErrorStrategy('domain')
export class DomainErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'domain'

  canHandle(error: unknown): boolean {
    return error instanceof DomainError
  }

  format(error: DomainError): OperationResultBuilder<null> {
    return OperationResultBuilder.error(error.name, error.code, error.message)
  }
}
