import { AuthResult } from '../auth.types'

// Supongamos que estas son las API keys válidas
const VALID_API_KEYS = ['123456', 'abcdef']

export async function validateApiKey(key?: string): Promise<AuthResult<{}>> {
  if (!key) return { success: false }

  const isValid = VALID_API_KEYS.includes(key)
  if (!isValid) return { success: false }

  return {
    success: true,
    payload: {}, // Payload vacío porque solo interesa la validación
  }
}

// Para usarla como estrategia de middleware:
export const apiKeyStrategy = async (header?: string, query?: string) => {
  return validateApiKey(header || query)
}
