const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Decoradores que buscás
const DECORATORS = ['RegisterRoute', 'RegisterErrorStrategy', 'EnableJobWorker']

function generateAutoImports() {
  const SRC_DIR = path.resolve(__dirname, 'src')
  const IMPORT_FILE = path.join(SRC_DIR, '__auto_imports__.ts')

  const files = glob.sync(`${SRC_DIR}/**/*.ts`)

  const isDecorated = (content) =>
    DECORATORS.some((decorator) => {
      const regex = new RegExp(`^\\s*@${decorator}\\b`, 'm') // solo líneas reales
      return regex.test(content)
    })

  const matchingFiles = files.filter((file) => {
    const content = fs.readFileSync(file, 'utf8')
    return isDecorated(content)
  })

  const imports = matchingFiles.map((file) => {
    const relative = './' + path.relative(SRC_DIR, file).replace(/\\/g, '/')
    return `import '${relative}';`
  })

  fs.writeFileSync(IMPORT_FILE, imports.join('\n'), 'utf8')
  console.log(`✅ Generado ${IMPORT_FILE} con ${matchingFiles.length} archivos decorados.`)
}

// ⚙️ Config común
const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/app.js',
  platform: 'node',
  target: 'es2020',
  format: 'cjs',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
}

// Detectar modo watch
const isWatch = process.argv.includes('--watch')

async function runBuild() {
  generateAutoImports()

  if (isWatch) {
    const ctx = await esbuild.context(config)

    await ctx.watch()
    console.log('👀 Modo watch activado con hot reload.')

    // Hook personalizado para regenerar los imports en cada rebuild
    ctx.onEnd = () => {
      generateAutoImports()
    }
  } else {
    await esbuild.build(config)
    console.log('✅ Build completo')

    // Limpiar __auto_imports__.ts
    try {
      fs.unlinkSync(path.resolve(__dirname, 'src/__auto_imports__.ts'))
      console.log('🧹 __auto_imports__.ts eliminado tras el build.')
    } catch (err) {
      console.warn('⚠️ No se pudo eliminar __auto_imports__.ts:', err.message)
    }
  }
}

runBuild().catch((err) => {
  console.error('❌ Error en build:', err)
  process.exit(1)
})
