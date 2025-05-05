import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import ContactsService from '../services/contacts.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: true,
})
export class Contacts {
  buildRoutes(app: OpenAPIHono): void {
    const service = new ContactsService()

    app.openapi(
      createRoute({
        tags: ['Contacts'],
        summary: `Get by Salesforce ID`,
        method: 'get',
        path: `/accounts/:accountSalesforceId/contacts/:salesforceId`,
        request: {
          params: z.object({
            accountSalesforceId: z.string(),
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
        const accountSalesforceId = c.req.param('accountSalesforceId')
        const salesforceId = c.req.param('salesforceId')

        return c.json(await service.getBySalesforceId(accountSalesforceId, salesforceId))
      }
    )
  }
}
