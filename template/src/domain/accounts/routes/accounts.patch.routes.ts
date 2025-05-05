import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { SfUpdateClient } from '../schemas/salesforce-client.schema'
import AccountsService from '../services/sap-account.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: false,
})
export class BusinessPartner {
  buildRoutes(app: OpenAPIHono): void {
    const service = new AccountsService()

    app.openapi(
      createRoute({
        tags: ['Accounts'],
        summary: `Update an instance of 'Account'`,
        method: 'patch',
        path: `/accounts/:salesforceId`,
        request: {
          params: z.object({
            salesforceId: z.string(),
          }),
          body: {
            content: {
              'application/json': {
                schema: SfUpdateClient.schema,
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

        return c.json(await service.updateAccount(salesforceId, body))
      }
    )
  }
}
