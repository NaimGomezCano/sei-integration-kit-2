import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { handledOpenAPIHono } from '../../handledOpenAPIHono'
import ApiKeyController from '../controllers/api-key.controller'

const apiKeyController = new ApiKeyController()

// Define el schema de query
const ApiKeyQuerySchema = z.object({
  api_key: z.string().min(1, 'API Key es requerida').optional(),
})

const apiKeyValidationRoute = createRoute({
  tags: ['Auth'],
  summary: 'Validar API Key',
  method: 'get',
  path: '/check/api-key',
  request: {
    query: ApiKeyQuerySchema,
  },
  responses: {
    200: {
      description: 'Resultado de la validación de la API Key',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
    400: {
      description: 'Solicitud incorrecta (API Key no proporcionada)',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
    401: {
      description: 'Error de autenticación (API Key inválida)',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
})

// Definir el tipo de contexto de la ruta
export const apiKeyRoutes = handledOpenAPIHono().openapi(apiKeyValidationRoute, async (c) => {
  const query = c.req.valid('query')
  const apiKeyHeader = c.req.header('x-api-key')
  const apiKey = apiKeyHeader || query.api_key

  if (!apiKey) {
    return c.json(OperationResultBuilder.success({ ok: false, message: 'API Key requerida' }).build(), 400)
  }

  const result = await apiKeyController.validateApiKey(apiKey)

  if (!result.success) {
    return c.json(OperationResultBuilder.success({ ok: false, message: 'API Key inválida' }).build(), 401)
  }

  return c.json(OperationResultBuilder.success({ ok: true, message: 'API Key válida' }).build(), 200)
})
