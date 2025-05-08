import { ErrorNames } from '@/core/errors/error-names'
import { AxiosError } from 'axios'
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

@RegisterErrorStrategy('network')
export class AxiosErrorStrategy implements ErrorStrategy {
  layer: ErrorLayer = 'network'

  canHandle(error: unknown): boolean {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError
      return true
    }

    return false
  }

  format(error: AxiosError): OperationResultBuilder<null> {
    if (error.code === 'ECONNRESET') {
      if (error.config) {
        return OperationResultBuilder.error(ErrorNames.AxiosError, `ECONNRESET`, `Error de conexión ${error.config.url}`)
      }
      return OperationResultBuilder.error(ErrorNames.AxiosError, `ECONNRESET`, `Error de conexión`)
    }

    if ((error as any).config) {
      try {
        const issue = (error as any).errors[0]
        const config = (error as any).config

        if (config.baseURL.includes(`b1s/v1`) || config.baseURL.includes(`b1s/v2`)) {
          return OperationResultBuilder.error(ErrorNames.AxiosError, `SAP_SL_CONN_ERROR`, `Error al conectar con SAP Business One Service Layer`)
        }
      } catch {}

     
    }

    try {
      return OperationResultBuilder.error(ErrorNames.AxiosError, `${error.code} - ${error.response}`, ``)
    } catch {}

    return OperationResultBuilder.error(ErrorNames.AxiosError, `${error.code}`, ``)
  }
}
