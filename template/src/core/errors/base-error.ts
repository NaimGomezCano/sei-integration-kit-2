export abstract class BaseError extends Error {
  public code: string
  public path?: any[]

  // Sobrecargas
  constructor(message: string, path?: any[])
  constructor(code: string, message: string, path?: any[])

  // Implementación
  constructor(a: string, b?: string | any[], c?: any[]) {
    const isOverloaded = typeof b === 'string'

    // Llamamos al super con el mensaje adecuado
    super(isOverloaded ? b : a)

    this.code = isOverloaded ? a : (this.constructor as any).DefaultCode
    this.path = isOverloaded ? c : b

    this.name = (this.constructor as any).ErrorName || this.constructor.name
  }
}
