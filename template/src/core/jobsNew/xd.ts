// EmailJobs.ts – Definición de un job de ejemplo
import { Job } from './JobDecorator'

class EmailJobs {
  // Registrar un job para enviar correos, con concurrencia 10 y timeout de 30 segundos
  @Job('send-email', { concurrency: 10, timeoutMs: 30000 })
  static async sendEmail(recipient: string, message: string): Promise<string> {
    // ... lógica de envío de email ...
    console.log(`Enviando correo a ${recipient}...`)
    // Simular envío exitoso
    return `Email enviado a ${recipient}`
  }
}
