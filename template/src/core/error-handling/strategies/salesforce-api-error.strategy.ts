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
    let result: any = ''

    try {
      const config = (error as any).config

      if (config.baseURL.includes(`salesforce.com`)) {
        try {
          if (error.code === 'ERR_BAD_REQUEST') {
            result = OperationResultBuilder.error(ErrorNames.AxiosError, 'SALESFORCE_API_ERROR', `Error con la API de Salesforce - ${JSON.stringify(error!.response!.data)}`)
          }
        } catch {}

        try {
          const errorResponse = (error as any).response?.data
          let errorMessages = ''

          if (Array.isArray(errorResponse)) {
            errorMessages = errorResponse.map((err: any) => err.message).join('\n')
          } else if (errorResponse?.message) {
            errorMessages = errorResponse.message
          }

          result = OperationResultBuilder.error(ErrorNames.AxiosError, 'SALESFORCE_API_ERROR', `Error con la API de Salesforce - ${errorMessages} \n ${JSON.stringify(error.response)}`)
        } catch {}

        try {
          result = OperationResultBuilder.error(ErrorNames.AxiosError, `SALESFORCE_API_ERROR`, `Error con la API de Salesforce - ${JSON.stringify((error as any).response.data)}`)
        } catch {}

        result = OperationResultBuilder.error(ErrorNames.AxiosError, `SALESFORCE_API_ERROR`, `Error con la API de Salesforce`)
      }
    } catch {}

    return result
  }
}
