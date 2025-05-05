import { BaseError } from './base-error'
import { DomainErrorCodes } from './error-codes'
import { ErrorNames } from './error-names'

export class DomainError extends BaseError {
  static DefaultCode = DomainErrorCodes.GENERIC
  static ErrorName = ErrorNames.DomainError
}
