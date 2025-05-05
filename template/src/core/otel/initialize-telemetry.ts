// src/logger/otel/init.ts

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { internalLogger } from '../logger/internal'

let sdk: NodeSDK | undefined

/**
 * Inicializa OpenTelemetry para trazas y métricas.
 * Debe llamarse al arrancar la app.
 */
export async function initializeTelemetry(): Promise<void> {
  if (sdk) return // evita reinicializar

  sdk = new NodeSDK({
    // traceExporter: new ConsoleSpanExporter(),
    /*metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
    }),*/
    instrumentations: [getNodeAutoInstrumentations()],
  })

  await sdk.start()
  internalLogger.otel.info('Telemetría inicializada')
}

/**
 * Detiene el SDK correctamente (ideal para shutdown de workers, pruebas, etc.)
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown()
    internalLogger.otel.info("Telemetría finalizada")
  }
}
