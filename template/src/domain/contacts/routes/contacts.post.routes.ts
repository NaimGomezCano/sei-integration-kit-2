import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SfCreateContact } from '../schemas/salesforce-contact.schema'
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
        summary: `Create an instance of 'Contact'`,
        method: 'post',
        path: '/accounts/:salesforceId/contacts',
        request: {
          params: z.object({
            salesforceId: z.string(),
          }),
          body: {
            content: {
              'application/json': {
                schema: SfCreateContact.schema,
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
        const salesforceId = c.req.param('salesforceId')
        //const body = c.req.valid('json')

        return c.json(await service.createContact(salesforceId, body))
      }
    )
  }
}
