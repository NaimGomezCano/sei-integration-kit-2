import { OperationResultBuilder } from '../operation-result/operation-result.builder'
import { ErrorLayer } from './layers'

export interface ErrorStrategy {
  layer: ErrorLayer
  canHandle(error: unknown): boolean
  format(error: unknown): OperationResultBuilder<null>
}