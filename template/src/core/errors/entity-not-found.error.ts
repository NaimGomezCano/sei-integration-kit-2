import { BaseError } from './base-error'
import { ErrorNames } from './error-names'

export class EntityNotFoundError extends BaseError {
  static DefaultCode = 'entity_not_found'
  static ErrorName = ErrorNames.EntityNotFoundError
}
