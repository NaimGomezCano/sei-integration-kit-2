import { ApiError } from '@/core/errors/api.error'
import { Context, Next } from 'hono'
import { apiKeyStrategy } from '../auth/strategies/api-key.strategy'

export async function apiKeyAuth(c: Context, next: Next): Promise<void> {
  const apiKeyHeader = c.req.header('x-api-key')
  const apiKeyQuery = c.req.query('api_key')
  const result = await apiKeyStrategy(apiKeyHeader, apiKeyQuery)

  if (!result.success) {
    throw new ApiError('Invalid API key')
  }

  c.set('user', result.payload)
  await next()
}
