/**
 * Devuelve una promesa que se resuelve con `value` (o void) tras `ms` milisegundos.
 * Útil para tests en los que necesitas “esperar” el tiempo que tardaría una petición real.
 *
 * @example
 * await delay(150);            // pausa 150 ms
 * const data = await delay(50, { ok: true }); // => { ok: true } tras 50 ms
 */
export function delay<T = void>(ms: number, value?: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(value as T), ms)
    // Limpieza por si usas fake timers (Jest, Vitest, etc.)
    if (typeof timer === 'object' && 'unref' in timer) {
      timer.unref?.()
    }
  })
}
