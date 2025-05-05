export async function basicStrategy(authHeader?: string) {
  if (!authHeader?.startsWith('Basic ')) return { success: false }

  const base64Credentials = authHeader.split(' ')[1]
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = decoded.split(':')

  // Validación simple — deberías conectarte a una base de datos aquí
  if (username === 'admin' && password === '1234') {
    return { success: true, payload: { username } }
  }

  return { success: false }
}
