const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')
const generateAutoImports = require('./generate-imports')
const stripJsonComments = require('strip-json-comments').default

// Obtener NODE_ENV desde entorno
const environment = process.env.NODE_ENV
if (!environment) {
  console.error('❌ Debes definir NODE_ENV (ej: NODE_ENV=production node esbuild.release.js)')
  process.exit(1)
}

// Cargar configuración JSON
const configPath = path.resolve(__dirname, '../../', `config.${environment}.jsonc`)
const localConfigPath = path.resolve(__dirname, '../../', `config.${environment}.local.jsonc`)

if (!fs.existsSync(configPath)) {
  console.error(`❌ Archivo de configuración no encontrado: ${configPath}`)
  process.exit(1)
}

let rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf-8')))

if (fs.existsSync(localConfigPath)) {
  const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'))
  rawConfig = { ...rawConfig, ...localConfig }
  console.log(`🔁 Configuración local aplicada desde ${localConfigPath}`)
}

// Detectar si se está usando --local
const isLocal = process.argv.includes('--local')

// Calcular ruta final de salida
let finalOutputDir
if (isLocal) {
  finalOutputDir = path.join(__dirname, '../../', 'build', environment, 'dist')
  console.log('📦 Generando build en modo LOCAL')
} else {
  const baseDeployDir = rawConfig.DEPLOY_DIR
  if (!baseDeployDir) {
    console.error(`❌ La variable DEPLOY_DIR no está definida en config.${environment}.jsonc`)
    process.exit(1)
  }
  finalOutputDir = path.join(baseDeployDir, 'SEI-SF-INTEGRATION', environment, 'dist')
  console.log(`🚀 Generando build para DEPLOY en: ${finalOutputDir}`)
}

const outputFile = path.join(finalOutputDir, 'app.js')

// Crear directorio si no existe
if (!fs.existsSync(finalOutputDir)) {
  fs.mkdirSync(finalOutputDir, { recursive: true })
  console.log(`📁 Directorio de salida creado: ${finalOutputDir}`)
}

// Si es modo deploy, generar web.config
if (!isLocal) {
  const port = rawConfig.APP_PORT
  if (!port) {
    console.error(`❌ La variable APP_PORT no está definida en config.${environment}.jsonc`)
    process.exit(1)
  }

  const webConfigContent = generateWebConfig(port)
  const webConfigPath = path.join(finalOutputDir, '..', 'web.config') // Un nivel arriba de /dist

  try {
    fs.writeFileSync(webConfigPath, webConfigContent)
    console.log(`🛠️  Archivo web.config generado en: ${webConfigPath}`)
  } catch (err) {
    console.error(`❌ Error al generar web.config: ${err.message}`)
    process.exit(1)
  }
}

// Generar imports automáticos
const importFilePath = generateAutoImports()

// Ejecutar build
esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: outputFile,
    platform: 'node',
    target: 'es2020',
    format: 'cjs',
    sourcemap: environment === 'development',
    minify: environment === 'production',
    tsconfig: 'tsconfig.json',
  })
  .then(() => {
    console.log(`✅ Build para entorno "${environment}" completado en ${outputFile}`)
    try {
      fs.unlinkSync(importFilePath)
      console.log('🧹 Archivo __auto_imports__.ts eliminado tras el build.')
    } catch (err) {
      console.warn('⚠️ No se pudo eliminar __auto_imports__.ts:', err.message)
    }
  })
  .catch((err) => {
    console.error('❌ Error durante el build:', err)
    process.exit(1)
  })

// Función para generar web.config dinámicamente
function generateWebConfig(port) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:${port}/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>`
}
