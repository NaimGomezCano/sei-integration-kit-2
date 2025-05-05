import type { LoginBody, LoginResponse } from '../schemas/jwt.schema'
import { JwtService } from '../services/jwt.service'

export default class JwtAuthController {
  private readonly authService: JwtService = new JwtService()

  async login(credentials: LoginBody, issuer?: string, audience?: string): Promise<LoginResponse> {
    return await this.authService.login(credentials, issuer, audience)
  }
}
