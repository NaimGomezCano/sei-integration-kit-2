// libs/hono/create-safe-openapi-hono.ts

import { OpenAPIHono } from '@hono/zod-openapi'

// Puedes ajustar esto si usas `BizException` u otro error personalizado
export function handledOpenAPIHono() {
  return new OpenAPIHono({
    defaultHook: (result: any, c) => {
      if (!result.success) {
        throw result.error
      }
    },
  })
}
