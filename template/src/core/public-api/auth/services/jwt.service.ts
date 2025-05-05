import { appEnv } from '@/appEnv'
import { ApiError } from '@/core/errors/api.error'
import { ApiErrorCodes } from '@/core/errors/error-codes'
import jwt from 'jsonwebtoken'
import type { LoginBody, LoginResponse } from '../schemas/jwt.schema'

export class JwtService {
  async login(credentials: LoginBody, issuer?: string, audience?: string): Promise<LoginResponse> {
    if (credentials.username !== 'skintech-sandbox' || credentials.password !== 'rvndcd185x7ybfr5uh') {
      throw new ApiError(ApiErrorCodes.BEARER_TOKEN_INVALID, 'The credentials provided are invalid.')
    }

    const expiresIn = appEnv.JWT_EXPIRES_IN

    const payload = {
      sub: credentials.username,
      aud: audience,
      iss: issuer,
    }

    const token = jwt.sign(payload, appEnv.JWT_SECRET, {
      expiresIn: `${expiresIn}s`,
    })

    const decoded = jwt.decode(token) as jwt.JwtPayload

    return {
      token,
      issued_at: new Date(decoded.iat! * 1000).toISOString(),
      expired_at: new Date(decoded.exp! * 1000).toISOString(),
    }
  }
}
