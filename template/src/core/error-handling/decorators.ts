import { internalLogger } from '../logger/internal'
import { registerErrorStrategy } from './error-strategy-registry'
import type { ErrorLayer } from './layers'
import { ErrorStrategy } from './types'

export function RegisterErrorStrategy(layer: ErrorLayer) {
  return function <T extends { new (...args: any[]): ErrorStrategy }>(ctor: T): T {
    internalLogger.core.info(`🚀 Ejecutando decorador para capa: ${layer}`) // Asegura que el decorador se ejecute

    const instance = new ctor()
    instance.layer = layer
    registerErrorStrategy(instance) // Llama a la función de registro
    return ctor
  }
}
