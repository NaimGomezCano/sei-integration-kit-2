import { Context, Next } from 'hono'
import { ApiError } from '@/core/errors/api.error'
import { ApiErrorCodes } from '@/core/errors/error-codes'
import { bearerStrategy } from '../auth/strategies/bearer.strategy'
import { basicStrategy } from '../auth/strategies/basic.strategy'


export async function authMiddleware (
  c: Context,
  next: Next,
): Promise<void> {
  const authHeader = c.req.header('Authorization')

  // Lista de estrategias disponibles
  const strategies = [
    (ctx: Context, header?: string) => bearerStrategy(ctx, header),
    (ctx: Context, header?: string) => basicStrategy(ctx, header),
  ] as const

  let lastError: unknown

  for (const strategy of strategies) {
    try {
      const { payload } = await strategy(c, authHeader)
      c.set('user', payload)
      await next()
      return
    } catch (err) {
      lastError = err
      // Continuamos con la siguiente estrategia
    }
  }

  // Si llegamos aquí es que ninguna estrategia pasó
  if (lastError instanceof ApiError) {
    throw lastError
  }

  throw new ApiError(
    ApiErrorCodes.AUTH_UNAUTHORIZED,
    'Unauthorized — no strategy matched',
  )
}