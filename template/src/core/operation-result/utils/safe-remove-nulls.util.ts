export function safeRemoveNulls<T extends object>(
  obj: T,
  excludeKeys: string[] = ['raw']
): Partial<T> {
  try {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (excludeKeys.includes(key)) {
        acc[key as keyof T] = value
      } else if (value !== null && value !== undefined) {
        acc[key as keyof T] =
          typeof value === 'object' && !Array.isArray(value)
            ? safeRemoveNulls(value as any, excludeKeys)
            : value
      }
      return acc
    }, {} as Partial<T>)
  } catch (err) {
    console.error('[safeRemoveNulls] Error eliminando nulls:', err)
    return obj // fallback: devuelve el objeto sin limpiar
  }
}
