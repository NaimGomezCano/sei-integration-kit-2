import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import SapReportsOrders from '../services/reports-orders.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: true,
})
export class ReportOrder {
  buildRoutes(app: OpenAPIHono): void {
    const service = new SapReportsOrders()

    app.openapi(
      createRoute({
        tags: ['Reports'],
        summary: `Get order report by Salesforce ID`,
        method: 'get',
        path: '/reports/orders/:salesforceId',
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

        return c.json(await service.getOrderReportBySalesforceID(salesforceId))
      }
    )
  }
}
