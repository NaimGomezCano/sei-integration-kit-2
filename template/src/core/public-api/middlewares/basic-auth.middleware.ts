import { ApiError } from '@/core/errors/api.error'
import { Context, Next } from 'hono'
import { basicStrategy } from '../auth/strategies/basic.strategy'

export async function basicAuth(c: Context, next: Next): Promise<void> {
  const authHeader = c.req.header('Authorization')
  const result = await basicStrategy(authHeader)
  if (!result.success) {
    throw new ApiError('Invalid basic credentials')
  }

  c.set('user', result.payload)
  await next()
}
