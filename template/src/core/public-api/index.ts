import { apiReference } from '@scalar/hono-api-reference'
import 'reflect-metadata'
//import { serveStatic } from 'hono/bun'
import { requestId } from 'hono/request-id'
import { appEnv } from '../../appEnv'

import { Context } from 'hono'
import { handleErrorToOperationResult } from '../error-handling/handle-error'
import { ApiError } from '../errors/api.error'
import { ApiErrorCodes } from '../errors/error-codes'
import { internalLogger } from '../logger/internal'
import { jwtRoutes } from './auth/routes/jwt.route'
import { handledOpenAPIHono } from './handledOpenAPIHono'
import { loggerMiddleware } from './middlewares/logger.middleware'
import { RouteRegistry } from './route-registry'

const app = handledOpenAPIHono()

app.use('*', loggerMiddleware)

app.use(requestId())

// Rutas para jwt -> obtener token, eliminar token (cerrar sesion), etc
app.route('/api/v1/authentication', jwtRoutes)



const account = async () => {
  //await loadApiRoutes() //TODO: Poner esto en otro sitio
  await RouteRegistry.applyRoutes(app)
}

account()

app
  .doc('/openapi', {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: appEnv.APP_NAME + ' - API Reference',
    },
  })
  .get(
    '/',
    apiReference({
      pageTitle: appEnv.APP_NAME + ' - API Reference',
      theme: 'bluePlanet',
      spec: {
        url: 'openapi',
      },
    })
  )

app.notFound((c) => {
  throw new ApiError(ApiErrorCodes.ROUTE_NOT_FOUND, `The requested endpoint was not found`, [c.req.url])
})

// Aqui gestiones los codigos de error HTTP que se devuelven segun el ApiErrorCodes. que tenga
/*
1xx	100–199	Informativos: el servidor recibió la solicitud, está procesando.
2xx	200–299	Éxito: la solicitud fue recibida y procesada correctamente.
3xx	300–399	Redirección: se necesita acción adicional para completar.
4xx	400–499	Error del cliente: la solicitud tiene errores (sintaxis, etc).
5xx	500–599	Error del servidor: el servidor falló al cumplir la solicitud.
*/
app.onError((err: Error, c: Context) => {
  const result = handleErrorToOperationResult(err)

  try {
    if (err instanceof ApiError) {
      if (err.code === ApiErrorCodes.ROUTE_NOT_FOUND) {
        return c.json(result, 404)
      }

      return c.json(result, 401)
    }

    // Aquí puedes añadir más tipos específicos
    // if (err instanceof ValidationError) {
    //   return c.json(result, 400)
    // }

    // if (err instanceof ConfigError) {
    //   return c.json(result, 500)
    // }
  } catch (error) {
    try {
      internalLogger.api.error('Error critico en app.onError', err)
    } catch (failsafe) {
      internalLogger.api.error('Error muy critico en app.onError')
    }
  }

  //internalLogger.api.error('Error en api capturado en app.onError', err)

  return c.json(result, 500)
})

export type AppType = typeof app
export default app