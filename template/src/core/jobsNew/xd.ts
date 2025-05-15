// example-usage.ts
import { context, trace } from '@opentelemetry/api'
import PgBoss from 'pg-boss'
import { Job } from './job-decorator'
import { JobManager } from './job-manager'

// Definir un job con el decorador @Job
class Jobs {
  // Decorador registra el job "processData" con concurrencia 2 y timeout de 5000ms
  @Job('processData', { concurrency: 2, timeoutMs: 5000 })
  static async processData(x: number): Promise<number> {
    // Simulación de trabajo: por ejemplo, elevar al cuadrado después de un retardo
    await new Promise((res) => setTimeout(res, 100)) // retardo de 100ms
    if (x < 0) {
      throw new Error('Número negativo no permitido') // ejemplo de error
    }
    return x * x
  }
}

