// src/public-api/route-registry.ts
import type { OpenAPIHono } from '@hono/zod-openapi'

type RegisterFn = (app: OpenAPIHono) => void

export class RouteRegistry {
  private static routes: RegisterFn[] = []

  static register(fn: RegisterFn) {
    this.routes.push(fn)
  }

  static applyRoutes(app: OpenAPIHono) {
    for (const fn of this.routes) {
      fn(app)
    }
  }
}
