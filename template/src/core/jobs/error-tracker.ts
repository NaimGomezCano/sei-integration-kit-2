const errorMap = new Map<string, Error>()

export function trackJobError(jobId: string, error: Error) {
  errorMap.set(jobId, error)
}

export function getJobError(jobId: string): Error | undefined {
  const error = errorMap.get(jobId)
  if (error) {
    errorMap.delete(jobId) // eliminar del map después de obtenerlo
  }
  return error
}

export function clearJobError(jobId: string) {
  errorMap.delete(jobId)
}
