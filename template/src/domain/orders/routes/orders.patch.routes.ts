import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { SfUpdateOrder } from '../schemas/salesforce-order.schema'
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
        summary: `Update an instance of 'Order'`,
        method: 'patch',
        path: `/orders/:salesforceId`,
        request: {
          params: z.object({
            salesforceId: z.string(),
          }),
          body: {
            content: {
              'application/json': {
                schema: SfUpdateOrder.schema,
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
      async (c: Context) => {
        const body = await c.req.json()
        const salesforceId = c.req.param('salesforceId')

        return c.json(await service.updateOrder(salesforceId, body))
      }
    )
  }
}
