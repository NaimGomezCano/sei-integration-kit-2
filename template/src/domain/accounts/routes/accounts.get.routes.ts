import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import SapAccountService from '../services/sap-account.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: true,
})
export class BusinessPartner {
  buildRoutes(app: OpenAPIHono): void {
    const service = new SapAccountService()

    app.openapi(
      createRoute({
        tags: ['Accounts'],
        summary: `Get by Salesforce ID`,
        method: 'get',
        path: '/accounts/:salesforceId',
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
