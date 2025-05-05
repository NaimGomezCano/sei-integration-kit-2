import { BaseError } from './base-error'
import { ApiErrorCodes } from './error-codes'
import { ErrorNames } from './error-names'

export class ApiError extends BaseError {
  static DefaultCode = ApiErrorCodes.GENERIC
  static ErrorName = ErrorNames.APIError
}
