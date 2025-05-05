//import { loadDecoratedFiles } from '@/core/loader/utils/load-decorated-files'
import path from 'path'
import { loadDecoratedFiles } from '../loader/utils/load-decorated-files'

// Usamos `import.meta.url` para obtener `__dirname` y construir la ruta

export async function loadErrorStrategies(): Promise<void> {
  await loadDecoratedFiles({
    from: path.resolve(__dirname, './strategies'), // Usamos la ruta relativa
    decorator: '@RegisterErrorStrategy', // Decorador a buscar
  })
}
