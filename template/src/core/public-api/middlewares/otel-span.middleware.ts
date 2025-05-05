// src/logger/middleware/otelSpan.ts

import { MiddlewareHandler } from 'hono';
import { trace, context as otelContext } from '@opentelemetry/api';

export const otelSpanMiddleware: MiddlewareHandler = async (c, next) => {
  const tracer = trace.getTracer('http-server');
  const span = tracer.startSpan(`HTTP ${c.req.method} ${c.req.path}`);

  const ctx = trace.setSpan(otelContext.active(), span);

  await otelContext.with(ctx, async () => {
    try {
      await next(); // ejecuta el handler
    } catch (err) {
      span.recordException(err as Error);
      throw err;
    } finally {
      span.setAttribute('http.method', c.req.method);
      span.setAttribute('http.route', c.req.path);
      span.setAttribute('http.status_code', c.res.status);
      span.end();
    }
  });
};
