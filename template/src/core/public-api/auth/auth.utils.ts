import { appEnv } from '@/appEnv'
import jwt from 'jsonwebtoken'

export function signToken(payload: object) {
  const token = jwt.sign(payload, appEnv.JWT_SECRET, { expiresIn: '1h' })
  return token
}
