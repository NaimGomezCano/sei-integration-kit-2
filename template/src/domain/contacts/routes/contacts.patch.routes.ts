import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import { SfUpdateContact } from '../schemas/salesforce-contact.schema'
import ContactsService from '../services/contacts.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: false,
})
export class Contacts {
  buildRoutes(app: OpenAPIHono): void {
    const service = new ContactsService()

    app.openapi(
      createRoute({
        tags: ['Contacts'],
        summary: `Update an instance of 'Contact'`,
        method: 'patch',
        path: `/accounts/:accountSalesforceId/contacts/:salesforceId`,
        request: {
          params: z.object({
            accountSalesforceId: z.string(),
            salesforceId: z.string(),
          }),
          body: {
            content: {
              'application/json': {
                schema: SfUpdateContact.schema,
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
        const accountSalesforceId = c.req.param('accountSalesforceId')
        const salesforceId = c.req.param('salesforceId')

        return c.json(await service.updateContact(accountSalesforceId, salesforceId, body))
      }
    )
  }
}
