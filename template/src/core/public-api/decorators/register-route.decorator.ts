import { internalLogger } from '@/core/logger/internal'
import { RouteRegistry } from '@/core/public-api/route-registry'
import { handledOpenAPIHono } from '../handledOpenAPIHono'
import { bearerAuthMiddleware } from '../middlewares/bearer-auth.middleware'
import { otelSpanMiddleware } from '../middlewares/otel-span.middleware'

interface RegisterRouteOptions {
  auth?: boolean
  version?: string
  subPath?: string
}

export function RegisterRoute(options?: RegisterRouteOptions) {
  const requireAuth = options?.auth !== false
  const version = options?.version ?? 'v1'
  const subPath = options?.subPath ?? ''

  return function (target: any) {
    try {
      const instance = new target()
      const routesApp = handledOpenAPIHono()

      if (requireAuth) {
        routesApp.use('*', otelSpanMiddleware)
        //routesApp.use('*', loggerMiddleware)
        routesApp.use('*', bearerAuthMiddleware)
      }

      if (typeof instance.buildRoutes !== 'function') {
        throw new Error(`La clase ${target.name} no implementa 'buildRoutes(app)'`)
      }

      instance.buildRoutes(routesApp)

      let basePath = `/${version}`
      if (subPath) {
        basePath += subPath.startsWith('/') ? subPath : `/${subPath}`
      }

      RouteRegistry.register((app) => {
        try {
          app.route(basePath, routesApp)
          internalLogger.core.info(`[RouteRegistry] Ruta registrada: ${basePath}`)
        } catch (err) {
          internalLogger.core.error(`[RouteRegistry] Error al registrar ruta ${basePath} para ${target.name}:`, { err })
        }
      })
    } catch (err) {
      console.error(`[RegisterRoute] Error al procesar ${target.name}:`, err)
    }
  }
}
