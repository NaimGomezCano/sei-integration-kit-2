const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const stripJsonComments = require('strip-json-comments').default

console.log('🟡 Iniciando run.js...\n')

// Verificamos el entorno
const environment = process.env.NODE_ENV
console.log(`🌍 NODE_ENV: ${environment}`)
if (!environment) {
  console.error('❌ Debes definir NODE_ENV (ej: NODE_ENV=production node run.js)')
  process.exit(1)
}

// Ruta a los archivos de configuración JSON
const configPath = path.resolve(__dirname, '../', `config.${environment}.jsonc`)
const localConfigPath = path.resolve(__dirname, '../', `config.${environment}.local.jsonc`)

console.log(`🔎 Buscando configuración en: ${configPath}`)
if (!fs.existsSync(configPath)) {
  console.error(`❌ Archivo de configuración no encontrado: ${configPath}`)
  process.exit(1)
}

// Cargamos la configuración base y la local si existe
let config = {}
try {
  config = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf-8')))
  console.log('✅ Configuración base cargada correctamente')
} catch (err) {
  console.error(`❌ Error al parsear ${configPath}:`, err.message)
  process.exit(1)
}

if (fs.existsSync(localConfigPath)) {
  try {
    const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'))
    config = { ...config, ...localConfig }
    console.log(`🔁 Configuración local aplicada desde ${localConfigPath}`)
  } catch (err) {
    console.error(`❌ Error al parsear ${localConfigPath}:`, err.message)
    process.exit(1)
  }
} else {
  console.log(`ℹ️  No se encontró configuración local (${localConfigPath})`)
}

// Verificamos si el flag --local está presente
const isLocal = process.argv.includes('--local')
console.log(`📍 Modo local: ${isLocal}`)

// Determinamos la ruta al archivo app.js
let appPath
if (isLocal) {
  appPath = path.resolve(__dirname, '../', 'build', environment, 'debug', 'app.js')
  console.log(`📦 Ejecutando build LOCAL: ${appPath}`)
} else {
  const deployDir = config.DEPLOY_DIR
  if (!deployDir) {
    console.error(`❌ La variable DEPLOY_DIR no está definida en config.${environment}.jsonc`)
    process.exit(1)
  }
  appPath = path.resolve(deployDir, 'SEI-SF-INTEGRATION', environment, 'dist', 'app.js')
  console.log(`🚀 Ejecutando build DEPLOY: ${appPath}`)
}

// Verificamos existencia del archivo
console.log(`📁 Verificando existencia de: ${appPath}`)
if (!fs.existsSync(appPath)) {
  console.error(`❌ El archivo app.js no existe en: ${appPath}`)
  console.warn(`🧠 Tip: Verifica si el build fue generado correctamente o si el path es correcto.`)
  process.exit(1)
}

// Pasamos las variables del config.jsonc como variables de entorno
const envVars = { ...process.env }
for (const [key, value] of Object.entries(config)) {
  envVars[key] = String(value)
}
console.log('🌱 Variables de entorno preparadas.\n')

// Ejecutamos app.js usando child_process
console.log(`🚀 Ejecutando aplicación: node ${appPath}\n`)

const subprocess = spawn('node', [appPath], {
  stdio: 'inherit',
  env: envVars,
})

subprocess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ La aplicación terminó con código de salida ${code}`)
  } else {
    console.log('✅ La aplicación se ejecutó correctamente.')
  }
})
