import { loadDecoratedFiles } from '@/core/loader/utils/load-decorated-files'
import path from 'path'

// Usamos `import.meta.url` para obtener `__dirname` y construir la ruta

// Simplemente pasamos la ruta relativa
export async function loadApiRoutes(): Promise<void> {
  await loadDecoratedFiles({
    from: path.resolve(__dirname, '../../domain'), // Pasamos la ruta relativa
    decorator: '@RegisterRoute', // Decorador a buscar
  })
}
