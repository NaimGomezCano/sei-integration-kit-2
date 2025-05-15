import { ApiError } from '@/core/errors/api.error'
import { ApiErrorCodes } from '@/core/errors/error-codes'
import { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { appEnv } from '@/appEnv'
import { jwtStrategy } from '../auth.utils'

export async function bearerStrategy(c: Context, authHeader?: string): Promise<{ payload: unknown }> {
  const cookieToken = getCookie(c, appEnv.JWT_COOKIE_NAME) // TODO: Parametrlizarlo

  // Bypass para tener la cookie en development
  if (cookieToken) {
    const result = await jwtStrategy(cookieToken)
    if (result.success) {
      return result
    }
  }

  if (!authHeader) {
    throw new ApiError(ApiErrorCodes.BEARER_TOKEN_MISSING, 'Authorization header is missing')
  }

  // Validar que no tenga múltiples "Bearer"
  const parts = authHeader.trim().split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new ApiError(ApiErrorCodes.BEARER_SCHEME_INVALID, `Authorization header must be in the format: Bearer <token>, received: ${authHeader}`)
  }

  const token = parts[1]
  if (!token) {
    throw new ApiError(ApiErrorCodes.BEARER_TOKEN_EMPTY, 'Bearer token is empty')
  }

  const result = await jwtStrategy(token)

  if (!result.success) {
    throw new ApiError(ApiErrorCodes.BEARER_TOKEN_INVALID, 'Invalid or expired bearer token')
  }

  return { payload: result.payload }
}
