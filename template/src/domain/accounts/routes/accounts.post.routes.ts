import { RegisterRoute } from '@/core/public-api/decorators/register-route.decorator'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SfCreateClient } from '../schemas/salesforce-client.schema'
import SapAccountService from '../services/sap-account.service'

@RegisterRoute({
  version: 'api/v1',
  subPath: 'integrations/salesforce',
  auth: false,
})
export class BusinessPartner {
  buildRoutes(app: OpenAPIHono): void {
    const service = new SapAccountService()

    app.openapi(
      createRoute({
        tags: ['Accounts'],
        summary: `Create an instance of 'Account'`,
        method: 'post',
        path: '/accounts',
        request: {
          body: {
            content: {
              'application/json': {
                schema: SfCreateClient.schema,
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

        //const newClient = await accountJobs.sapCreateAccount(body)

        //return c.json(newClient)
        return c.json(await service.createAccount(body))
      }
    )
  }
}
