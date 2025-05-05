import { ApiError } from '@/core/errors/api.error'
import { ApiErrorCodes } from '@/core/errors/error-codes'
import { Context, Next } from 'hono'
import { bearerStrategy } from '../auth/strategies/bearer.strategy'

export async function bearerAuthMiddleware(c: Context, next: Next): Promise<void> {
  try {
    const { payload } = await bearerStrategy(c, c.req.header('Authorization'))
    c.set('user', payload)
    await next()
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }

    throw new ApiError(ApiErrorCodes.BEARER_UNEXPECTED_ERROR, 'Unexpected error during bearer authentication')
  }
}
