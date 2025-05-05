// libs/hono/create-safe-openapi-hono.ts

import { OpenAPIHono } from '@hono/zod-openapi'

// Puedes ajustar esto si usas `BizException` u otro error personalizado
export function handledOpenAPIHono() {
  return new OpenAPIHono({
    defaultHook: (result: any, c) => {
      if (!result.success) {
        // Aquí puedes lanzar una excepción, devolver un JSON, o loguear
        throw result.error // O personaliza: new BizException(...)
      }
    },
  })
}
