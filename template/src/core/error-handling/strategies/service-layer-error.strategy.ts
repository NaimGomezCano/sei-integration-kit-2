import { ErrorNames } from '@/core/errors/error-names'
import { OperationResultBuilder } from '../../operation-result/operation-result.builder'
import { RegisterErrorStrategy } from '../decorators'
import { ErrorLayer } from '../layers'
import { ErrorStrategy } from '../types'

export interface ServiceLayerError {
  response: {
    data: {
      error: {
        message: {
          value: string
        }
        code: string
      }
    }
    request: {
      path: string
    }
  }
}

@RegisterErrorStrategy('application')
export class ServiceLayerErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'application'

  canHandle(error: unknown): boolean {
    if ((error as any).isAxiosError) {
      const axiosError = error as any
      return axiosError?.response?.request?.path?.includes('/b1s/v')
    }
    return false
  }

  format(error: ServiceLayerError): OperationResultBuilder<null> {
    const raw = error.response?.data?.error
    const message = error.response.data.error.message.value ?? 'Error desconocido en SAP Service Layer'
    const code = raw?.code ? `sl_error_(${raw.code})` : 'sl_unknown'

    return OperationResultBuilder.error(ErrorNames.ServiceLayerError, code, message, ['sap', error.response.request.path])
  }
}
