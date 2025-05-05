import { EntityNotFoundError } from '@/core/errors/entity-not-found.error'

type EntityNotFoundHandler = (msg: string) => Error

interface RequireEntityOptions {
  notFoundMessage?: string
  errorFactory?: EntityNotFoundHandler
}

export async function requireEntity<T>(promise: Promise<T | null>, options?: RequireEntityOptions): Promise<T> {
  const result = await promise
  if (!result) {
    const message = options?.notFoundMessage ?? 'Entity not found'
    const error = options?.errorFactory?.(message) ?? new EntityNotFoundError(message)
    throw error
  }
  return result
}
