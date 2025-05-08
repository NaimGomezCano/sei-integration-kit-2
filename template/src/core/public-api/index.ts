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

/*app.use(
  logger((val) => {
    appLogger.info(val)
  })
)*/

//app.use('*', otelSpanMiddleware)

/*app.use(
  logger((val) => {
    internalLogger.core.info(val)
  })
)*/

app.use('*', loggerMiddleware)

app.use(requestId())

if (appEnv.JWT_SECRET) {
  internalLogger.core.info('Using JWT middleware')
  //app.route('/api/auth', authRoutes)
}

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

//app.openAPIRegistry.register('AppResponse', AppResponseSchema)
//app.openAPIRegistry.register('AppSyncResponse', SyncResponseSchema)
//app.openAPIRegistry.register('AppErrorResponse', AppErrorResponseSchema)

// Middlewares

/*if (env.USE_SAP_APILOG) {
  appLogger.info('Using SAP API logger middleware')
  app.use(httpLoggerMiddleware)
}*/

//app.route('/api/v1/authentication', apiKeyRoutes)
/*app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
})*/

//app.use('/api/*', authMiddleware)
//app.use('/api/*', jwtAuthMiddleware)

// Carga automática de clases decoradas

/*
app.post('/auth/jwt', async (c) => {
  const { username, password } = await c.req.json()

  // Validación simulada, aquí deberías consultar tu DB
  if (username === 'user' && password === '1234') {
    const token = signToken({ username })
    return c.json({ token })
  }

  return c.json({ error: 'Credenciales inválidas' }, 401)
})

// --------------------------
// Registro de API Key (ejemplo simple)
// --------------------------
app.post('/auth/api-key', async (c) => {
  const { appName } = await c.req.json()

  if (!appName) {
    return c.json({ error: 'appName requerido' }, 400)
  }

  // Generación aleatoria de API Key
  const apiKey = crypto.randomUUID() // Puedes usar nanoid o uuid también

  // Aquí guardarías en la base de datos con el appName
  // por ahora simulamos respuesta
  return c.json({ apiKey, appName })
})

// --------------------------
// Endpoint de prueba para Basic Auth (opcional)
// --------------------------
app.get('/auth/basic', async (c) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return c.json({ error: 'Encabezado Basic Auth faltante' }, 401)
  }

  const base64 = authHeader.split(' ')[1]
  const decoded = Buffer.from(base64, 'base64').toString()
  const [username, password] = decoded.split(':')

  if (username === 'admin' && password === '1234') {
    return c.json({ message: 'Autenticación exitosa', username })
  }

  return c.json({ error: 'Credenciales inválidas' }, 401)
})*/

// Routes

// OpenAPI documentation (Should be after all public routes)

//Static files
//app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
//app.use(
//  '/public/*',
//  serveStatic({
//    root: './',
//    precompressed: true,
//    onFound: (_path, c) => {
//      c.header('Cache-Control', `public, immutable, max-age=31536000`)
//    },
//    onNotFound(path, c) {
//      console.log(`${path} is not found, you access ${c.req.path}`)
//    },
//  })
//)
//

/*app.onError((err: Error, c: Context) => {
  if (env.JWT_SECRET && err.message === 'Unauthorized') {
    return c.json(new BizException(ErrorCodeEnum.Unauthorized, 'Invalid JWT token'), 401)
  }

  if (err instanceof BizException) {
    return c.json(err, err.status)
  }

  const defaultError = new BizException(ErrorCodeEnum.Default, `Internal Server Error: ${err.message || 'Unknown Error'}`)

  return c.json(defaultError, defaultError.status)
})
*/
