import { internalLogger } from '@/core/logger/internal'
import { LogEntryApi } from '@/core/logger/types'
import { MiddlewareHandler } from 'hono'

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || (c.req.raw as any)?.ip || 'unknown'

  const method = c.req.method
  const path = c.req.path
  const userAgent = c.req.header('user-agent') || 'unknown'
  const contentType = c.req.header('content-type')

  let requestBody: any = null
  try {
    if (contentType?.includes('application/json')) {
      requestBody = await c.req.json()
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      requestBody = await c.req.formData()
    } else {
      requestBody = await c.req.text()
    }
  } catch {
    requestBody = 'Could not parse request body'
  }

  const start = Date.now()

  try {
    await next()
  } catch (error) {
    console.log(1)
  }

  const statusCode = c.res.status
  const durationMs = Date.now() - start

  let responseBody = 'Not captured'

  try {
    const cloned = c.res.clone()
    const contentType = cloned.headers.get('Content-Type') || ''

    if (contentType.includes('application/json')) {
      responseBody = await cloned.json() // deja como objeto
    } else if (contentType.includes('text/')) {
      responseBody = await cloned.text()
    }
  } catch {
    responseBody = 'Could not read response body'
  }

  const logData: LogEntryApi = {
    method,
    path,
    statusCode,
    durationMs,
    ip,
    userAgent,
     requestBody,
    responseBody,
  }

  if (statusCode >= 400) {
    internalLogger.api.errorRequest(logData)
  } else {
    internalLogger.api.infoRequest(logData)
  }
}
