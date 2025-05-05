import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

function findFilesWithDecorator(dir: string, decorator: string): string[] {
  const files: string[] = []

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findFilesWithDecorator(fullPath, decorator))
    } else if ((fullPath.endsWith('.ts') || fullPath.endsWith('.js')) && fs.readFileSync(fullPath, 'utf-8').includes(decorator)) {
      files.push(fullPath)
    }
  }

  return files
}

export async function loadDecoratedFiles(options: {
  from: string // Ruta absoluta
  decorator: string // Patrón a buscar, ej. "@RegisterRoute"
}): Promise<void> {
  const files = findFilesWithDecorator(options.from, options.decorator)

  for (const file of files) {
    const url = pathToFileURL(file).href
    await import(url) // Importa dinámicamente => ejecuta el decorador
  }
}
