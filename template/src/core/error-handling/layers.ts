/**
 * Capas del sistema para clasificar estrategias de error.
 * El orden determina la prioridad de resolución (mayor primero).
 */
export type ErrorLayer =
  | 'domain'          // Validaciones de dominio, invariantes, reglas de negocio puras
  | 'application'     // Errores de lógica de aplicación o servicios internos
  | 'integration'     // Servicios externos como SAP, Salesforce, etc.
  | 'network'         // Fallos de red, axios, timeouts, etc.
  | 'infrastructure'  // Base de datos, disco, sistema de archivos
  | 'unknown'         // Errores no clasificados

/**
 * Prioridad de cada capa.
 * A mayor número, mayor prioridad al resolver el error.
 */
export const ErrorLayerOrder: Record<ErrorLayer, number> = {
  domain: 100,
  application: 80,
  integration: 60,
  network: 40,
  infrastructure: 20,
  unknown: 0,
}

// Ejemplos: Service Layer - modules
// Ejemplo: Zod - 