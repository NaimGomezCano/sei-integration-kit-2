import { appEnv } from '@/appEnv'
import { OperationResultBuilder } from '@/core/operation-result/operation-result.builder'
import JwtAuthController from '@/core/public-api/auth/controllers/jwt.controller'
import { LoginBodySchema } from '@/core/public-api/auth/schemas/jwt.schema'
import { createRoute, z } from '@hono/zod-openapi'
import { setCookie } from 'hono/cookie'
import { handledOpenAPIHono } from '../../handledOpenAPIHono'

const jwtRequestRoute = createRoute({
  tags: ['Auth'],
  summary: 'JWT Authentication',
  method: 'post',
  path: '/credentials',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginBodySchema,
        },
      },
      description: 'Authentication body',
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Login',
      content: {
        'application/json': {
          schema: z.any(),
        },
      },
    },
  },
})

const authController = new JwtAuthController()

export const jwtRoutes = handledOpenAPIHono().openapi(jwtRequestRoute, async (c) => {
  const body = await c.req.json()
  const host = c.req.header('host')
  const response = await authController.login(body, host, host)

  // TODO: hacer una variable en el .env para que sea opcional
  setCookie(c, appEnv.JWT_COOKIE_NAME, response.token, {
    expires: new Date(response.expired_at),
    httpOnly: true,
    secure: true,
    maxAge: Number(appEnv.JWT_EXPIRES_IN),
    path: '/',
    sameSite: 'strict',
  })

  return c.json(OperationResultBuilder.success(response).build())
})
