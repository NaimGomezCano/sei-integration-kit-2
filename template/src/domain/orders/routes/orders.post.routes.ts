import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SfCreateOrder } from '../schemas/salesforce-order.schema'
import OrderService from '../services/orders.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: false,
})
export class Orders {
  buildRoutes(app: OpenAPIHono): void {
    const service = new OrderService()

    app.openapi(
      createRoute({
        tags: ['Orders'],
        summary: `Create an instance of 'Order'`,
        method: 'post',
        path: '/orders',
        request: {
          body: {
            content: {
              'application/json': {
                schema: SfCreateOrder.schema,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: z.any(),
              },
            },
          },
        },
      }),
      async (c) => {
        const body = await c.req.json()

        return c.json(await service.createOrder(body))
      }
    )
  }
}
