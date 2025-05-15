import { ErrorNames } from '@/core/errors/error-names'
import { AxiosError } from 'axios'
import { OperationResultBuilder } from '../../operation-result/operation-result.builder'
import { RegisterErrorStrategy } from '../decorators'
import { ErrorLayer } from '../layers'
import { ErrorStrategy } from '../types'

@RegisterErrorStrategy('application')
export class SalesforceApiErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'application'

  canHandle(error: unknown): boolean {
    try {
      if ((error as any).isAxiosError) {
        const axiosError = error as any

        const config = (axiosError as any).config

        return config.baseURL.includes(`salesforce.com`)
      }
    } catch (error) {
      return false
    }
    return false
  }

  format(error: AxiosError): OperationResultBuilder<null> {
    try {
      const result = OperationResultBuilder.error(ErrorNames.SalesforceApiError, error.code ?? '', `Error con la API de Salesforce - ${JSON.stringify(error.response)}`)
      return result
    } catch {}

    try {
      const result = OperationResultBuilder.error(ErrorNames.SalesforceApiError, error.code ?? '', `Error con la API de Salesforce - ${JSON.stringify(error)}`)
      return result
    } catch {}

    try {
      if (error.code === 'ERR_BAD_REQUEST') {
        const result = OperationResultBuilder.error(ErrorNames.SalesforceApiError, error.code, `Error con la API de Salesforce - ${JSON.stringify(error!.response!.data)}`)
        return result
      }
    } catch {}

    return OperationResultBuilder.error(ErrorNames.SalesforceApiError, '?', `Error con la API de Salesforce - No se ha podido obtener el error exacto`)
  }
}
