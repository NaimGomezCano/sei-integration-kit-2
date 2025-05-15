import { appEnv } from '@/appEnv'
import { ApiError } from '@/core/errors/api.error'
import { ApiErrorCodes } from '@/core/errors/error-codes'
import { Context, Next } from 'hono'
import { bearerStrategy } from './bearer.strategy' // Ajusta la ruta según tu estructura de carpetas

/**
 * Valida credenciales Basic.
 * Formato esperado del header:
 *   Authorization: Basic base64(username:password)
 * Devuelve el mismo shape de bearerStrategy → { payload }
 */
export async function basicStrategy(c: Context, authHeader?: string): Promise<{ payload: unknown }> {
  if (!authHeader) {
    throw new ApiError(ApiErrorCodes.BASIC_HEADER_MISSING, 'Authorization header is missing')
  }

  const parts = authHeader.trim().split(' ')
  if (parts.length !== 2 || parts[0] !== 'Basic') {
    throw new ApiError(ApiErrorCodes.BASIC_SCHEME_INVALID, `Authorization header must be in the format: Basic <base64(username:password)>, received: ${authHeader}`)
  }

  const encodedCredentials = parts[1]
  if (!encodedCredentials) {
    throw new ApiError(ApiErrorCodes.BASIC_HEADER_EMPTY, 'Basic credentials are empty')
  }

  let decoded: string
  try {
    decoded = Buffer.from(encodedCredentials, 'base64').toString('utf8')
  } catch {
    throw new ApiError(ApiErrorCodes.BASIC_CREDENTIALS_INVALID, 'Credentials are not valid base64')
  }

  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) {
    throw new ApiError(ApiErrorCodes.BASIC_CREDENTIALS_INVALID, 'Credentials must be in the format username:password')
  }

  const username = decoded.slice(0, separatorIndex)
  const password = decoded.slice(separatorIndex + 1)

  if (!username || !password) {
    throw new ApiError(ApiErrorCodes.BASIC_CREDENTIALS_INVALID, 'Username or password is empty')
  }

  // TODO: Reemplaza por tu mecanismo real de validación (BD, servicio externo, etc.)
  const userPayload = await validateBasicCredentials(username, password)
  if (!userPayload) {
    throw new ApiError(ApiErrorCodes.BASIC_CREDENTIALS_INVALID, 'Invalid username or password')
  }

  return { payload: userPayload }
}

/**
 * Middleware único que intenta varias estrategias de autenticación.
 * Añade `c.set('user', payload)` cuando una de ellas tiene éxito.
 * Solo lanza error si TODAS fallan.
 */
export async function authMiddleware(c: Context, next: Next): Promise<void> {
  const authHeader = c.req.header('Authorization')

  // Lista de estrategias disponibles
  const strategies = [(ctx: Context, header?: string) => bearerStrategy(ctx, header), (ctx: Context, header?: string) => basicStrategy(ctx, header)] as const

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

  throw new ApiError(ApiErrorCodes.AUTH_UNAUTHORIZED, 'Unauthorized — no strategy matched')
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ejemplo mínimo de validación de credenciales Basic.
 * Sustituye esta función por acceso a tu modelo/servicio de usuarios.
 */
async function validateBasicCredentials(username: string, password: string): Promise<unknown | null> {
  const isValid = username === appEnv.AUTH_PUBLIC_API_USERNAME && password === appEnv.AUTH_PUBLIC_API_PASSWORD
  if (!isValid) return null

  return { sub: username }

  return null
}
