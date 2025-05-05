import { internalLogger } from '../logger/internal'
import { ErrorLayerOrder } from './layers'
import { ErrorStrategy } from './types'

const strategyRegistry: ErrorStrategy[] = []

export function registerErrorStrategy(strategy: ErrorStrategy): void {
  internalLogger.core.info(`🔴 Registrando estrategia de error: ${strategy.constructor.name}`)
  strategyRegistry.push(strategy)
}

export function getErrorStrategies(): ErrorStrategy[] {
  return [...strategyRegistry].sort((a, b) => ErrorLayerOrder[b.layer] - ErrorLayerOrder[a.layer])
}
