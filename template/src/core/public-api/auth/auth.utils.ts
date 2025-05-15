import { appEnv } from '@/appEnv'
import jwt from 'jsonwebtoken'
import { AuthResult } from './auth.types'

export async function jwtStrategy(token: string): Promise<AuthResult> {
  try {
    const payload = jwt.verify(token, appEnv.JWT_SECRET)

    return {
      success: true,
      payload,
    }
  } catch (error) {
    return {
      success: false,
    }
  }
}

export function signToken(payload: object) {
  const token = jwt.sign(payload, appEnv.JWT_SECRET, { expiresIn: '1h' })
  return token
}
