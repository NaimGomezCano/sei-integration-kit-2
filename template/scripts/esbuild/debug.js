const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')
const generateAutoImports = require('./generate-imports')
const stripJsonComments = require('strip-json-comments').default

const environment = process.env.NODE_ENV
if (!environment) {
  console.error('❌ Debes definir NODE_ENV (ej: NODE_ENV=test node esbuild.debug.js)')
  process.exit(1)
}

const configPath = path.resolve(__dirname, '../../', `config.${environment}.jsonc`)
const localConfigPath = path.resolve(__dirname, '../../', `config.${environment}.local.jsonc`)

if (!fs.existsSync(configPath)) {
  console.error(`❌ Archivo de configuración no encontrado: ${configPath}`)
  process.exit(1)
}

let rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf-8')))
//let rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

if (fs.existsSync(localConfigPath)) {
  const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'))
  rawConfig = { ...rawConfig, ...localConfig }
  console.log(`🔁 Configuración local aplicada desde ${localConfigPath}`)
}

const isLocal = process.argv.includes('--local')

let finalOutputDir
if (isLocal) {
  finalOutputDir = path.join(__dirname, '../../', 'build', environment, 'debug')
  console.log('🔧 Generando debug build en modo LOCAL')
} else {
  const baseDeployDir = rawConfig.DEPLOY_DIR || path.join(__dirname, '../../', 'build')
  finalOutputDir = path.join(baseDeployDir, 'SEI-SF-INTEGRATION', environment, 'debug')
  console.log(`🐞 Generando debug build para entorno "${environment}" en: ${finalOutputDir}`)
}

const outputFile = path.join(finalOutputDir, 'app.js')

if (!fs.existsSync(finalOutputDir)) {
  fs.mkdirSync(finalOutputDir, { recursive: true })
  console.log(`📁 Directorio de salida creado: ${finalOutputDir}`)
}

const importFilePath = generateAutoImports()

// ⚙️ Compilar con incremental sin watch
async function buildOnce() {
  try {
    const ctx = await esbuild.context({
      entryPoints: ['src/index.ts'],
      bundle: true,
      outfile: outputFile,
      platform: 'node',
      target: 'esnext',
      format: 'cjs',
      sourcemap: true,
      minify: false,
      tsconfig: 'tsconfig.json',
      define: {
        'process.env.NODE_ENV': `"${environment}"`,
      },
      logLevel: 'info',
    })

    await ctx.rebuild()
    console.log(`✅ Build DEBUG (incremental) completado en ${outputFile}`)

    try {
      // fs.unlinkSync(importFilePath)
      console.log('🧹 Archivo __auto_imports__.ts eliminado tras el build.')
    } catch (err) {
      console.warn('⚠️ No se pudo eliminar __auto_imports__.ts:', err.message)
    }

    await ctx.dispose() // limpiar recursos
  } catch (err) {
    console.error('❌ Error durante el build (debug):', err)
    process.exit(1)
  }
}

buildOnce()
