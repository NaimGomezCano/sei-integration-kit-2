import { validateApiKey } from '../strategies/api-key.strategy'

export default class ApiKeyController {
  async validateApiKey(apiKey?: string) {
    return validateApiKey(apiKey)
  }
}
