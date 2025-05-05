import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import ContactsService from '../services/orders.service'
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
        summary: `Get by Salesforce ID`,
        method: 'get',
        path: `/orders/:salesforceId`,
        request: {
          params: z.object({
            salesforceId: z.string(),
          }),
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
        const salesforceId = c.req.param('salesforceId')

        return c.json(await service.getBySalesforceId(salesforceId))
      }
    )
  }
}
