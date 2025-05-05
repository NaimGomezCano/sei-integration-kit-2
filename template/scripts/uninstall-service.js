const path = require('path')
const fs = require('fs')
const { execSync, exec } = require('child_process')
const isAdmin = require('is-admin').default

const NSSM_CMD = 'nssm'

function runCommand(command, description = '') {
  try {
    console.log(`\n🚀 ${description || 'Ejecutando'}: ${command}`)
    const output = execSync(command, { stdio: 'pipe' }).toString().trim()
    if (output) {
      console.log(`📤 Resultado:\n${output}`)
    } else {
      console.log('✅ Comando ejecutado sin salida.')
    }
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : error.message
    console.error(`❌ ERROR en "${description || command}":\n🧨 Detalle: ${stderr}`)
  }
}

function verifyServiceRemoved(displayNamePattern) {
  console.log(`🔍 Verificando que el servicio "${displayNamePattern}" fue eliminado (esperando 5s)...`)
  setTimeout(() => {
    const psCommand = `powershell -Command "Get-Service | Where-Object { $_.DisplayName -like '*${displayNamePattern}*' } | Format-List Name,DisplayName,Status"`
    exec(psCommand, { windowsHide: true }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`⚠️ PowerShell lanzó un error:\n${stderr || error.message}`)
        return
      }

      if (!stdout.trim()) {
        console.log(`✅ Servicio "${displayNamePattern}" no se encuentra registrado. Eliminación confirmada.`)
      } else {
        console.warn(`⚠️ Aún se detecta un servicio con DisplayName similar a "${displayNamePattern}":\n${stdout}`)
      }
    })
  }, 5000)
}

async function main() {
  console.log('🛡️ Verificando permisos de administrador...')
  const admin = await isAdmin()
  if (!admin) {
    console.error('❌ Este script requiere permisos de administrador.')
    process.exit(1)
  }
  console.log('✅ Permisos de administrador confirmados.\n')

  const envArg = process.argv.find((arg) => arg.startsWith('--env='))
  const ENV = envArg ? envArg.split('=')[1] : process.env.NODE_ENV

  if (!ENV) {
    console.error('❌ No se especificó un entorno. Usa "--env=nombre" o define NODE_ENV.')
    process.exit(1)
  }

  const configPath = path.resolve(__dirname, `../config.${ENV}.jsonc`)
  const localConfigPath = path.resolve(__dirname, `../config.${ENV}.local.jsonc`)

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Archivo de configuración base no encontrado: ${configPath}`)
    process.exit(1)
  }

  let rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  if (fs.existsSync(localConfigPath)) {
    const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'))
    rawConfig = { ...rawConfig, ...localConfig }
  }

  const { APP_NAME } = rawConfig
  if (!APP_NAME) {
    console.error('❌ APP_NAME no definido en el archivo de configuración.')
    process.exit(1)
  }

  const SERVICE_NAME = `${APP_NAME}_${ENV}`

  console.log(`🧹 Iniciando proceso de desinstalación para: ${SERVICE_NAME}`)

  runCommand(`${NSSM_CMD} stop ${SERVICE_NAME}`, `Detener servicio (${SERVICE_NAME})`)
  runCommand(`${NSSM_CMD} remove ${SERVICE_NAME} confirm`, `Eliminar servicio (${SERVICE_NAME})`)

  verifyServiceRemoved(SERVICE_NAME)
}

main().catch((err) => {
  console.error('💥 Error general en el script:', err)
  process.exit(1)
})
