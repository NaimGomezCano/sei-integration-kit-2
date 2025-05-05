import { BaseError } from './base-error'
import { CoreErrorCodes } from './error-codes'
import { ErrorNames } from './error-names'

export class CoreError extends BaseError {
  static DefaultCode = CoreErrorCodes.GENERIC
  static ErrorName = ErrorNames.CoreError
}
