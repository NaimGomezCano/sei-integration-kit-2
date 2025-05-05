const path = require('path')
const fs = require('fs')
const { execSync, exec } = require('child_process')
const isAdmin = require('is-admin').default
const stripJsonComments = require('strip-json-comments').default

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

function verifyServiceInstalled(displayNamePattern) {
  console.log(`🔍 Verificando instalación del servicio "${displayNamePattern}" (esperando 5s)...`)
  setTimeout(() => {
    const psCommand = `powershell -Command "Get-Service | Where-Object { $_.DisplayName -like '*${displayNamePattern}*' } | Format-List Name,DisplayName,Status"`
    exec(psCommand, { windowsHide: true }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`⚠️ PowerShell lanzó un error:\n${stderr || error.message}`)
        return
      }

      if (!stdout.trim()) {
        console.warn(`⚠️ No se detectó el servicio "${displayNamePattern}".`)
      } else {
        console.log(`✅ Servicio instalado correctamente:\n${stdout}`)
      }
    })
  }, 5000)
}

async function main() {
  console.log('🛡️ Verificando permisos de administrador...')
  const admin = await isAdmin()
  if (!admin) {
    console.error('❌ Este script debe ejecutarse como administrador.')
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

  let rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf-8')))
  if (fs.existsSync(localConfigPath)) {
    const localConfig = JSON.parse(stripJsonComments(fs.readFileSync(localConfigPath, 'utf-8')))
    rawConfig = { ...rawConfig, ...localConfig }
  }

  const { APP_NAME, DEPLOY_DIR } = rawConfig
  if (!APP_NAME || !DEPLOY_DIR) {
    console.error('❌ APP_NAME o DEPLOY_DIR no definidos en el archivo de configuración.')
    process.exit(1)
  }

  const SERVICE_NAME = `${APP_NAME}_${ENV}`
  const basePath = path.resolve(DEPLOY_DIR, 'SEI-SF-INTEGRATION', ENV)
  const appPath = path.resolve(basePath, 'dist', 'app.js')
  const logPath = path.join(basePath, 'dist')

  if (!fs.existsSync(appPath)) {
    console.error(`❌ No se encontró el script del servicio en: ${appPath}`)
    process.exit(1)
  }

  let envVariables = Object.entries(rawConfig).map(([name, value]) => ({ name, value: String(value) }))
  envVariables.push({ name: 'NODE_ENV', value: ENV })
  envVariables.push({ name: 'IS_DEPLOY', value: 'true' })

  const dotenvPath = path.resolve(basePath, 'dist', '.env.deploy')
  const dotenvContent = envVariables.map(({ name, value }) => `${name}=${value.replace(/\n/g, '\\n')}`).join('\n')
  fs.writeFileSync(dotenvPath, dotenvContent, 'utf-8')
  console.log(`✅ Archivo .env.deploy generado: ${dotenvPath}`)

  // 🔁 DESINSTALAR servicio previo si existe
  console.log(`\n🔁 Desinstalando servicio previo (${SERVICE_NAME})...`)
  runCommand(`${NSSM_CMD} stop ${SERVICE_NAME}`, `Detener servicio (${SERVICE_NAME})`)
  runCommand(`${NSSM_CMD} remove ${SERVICE_NAME} confirm`, `Eliminar servicio (${SERVICE_NAME})`)

  // 🚀 INSTALAR nuevo servicio
  console.log(`\n🚀 Instalando nuevo servicio "${SERVICE_NAME}"...`)
  runCommand(`${NSSM_CMD} install ${SERVICE_NAME} "${process.execPath}" "${appPath}" --env=${ENV} --deploy=true`, 'Instalando servicio con NSSM')
  runCommand(`${NSSM_CMD} set ${SERVICE_NAME} AppDirectory "${basePath}"`, 'Estableciendo directorio de trabajo')

  const envString = envVariables.map(({ name, value }) => `${name}=${value}`).join(' ')
  runCommand(`${NSSM_CMD} set ${SERVICE_NAME} AppEnvironmentExtra "${envString}"`, 'Asignando variables de entorno')

  // Logs opcionales
  // runCommand(`${NSSM_CMD} set ${SERVICE_NAME} AppStdout "${path.join(logPath, SERVICE_NAME + '_out.log')}"`)
  // runCommand(`${NSSM_CMD} set ${SERVICE_NAME} AppStderr "${path.join(logPath, SERVICE_NAME + '_err.log')}"`)

  runCommand(`${NSSM_CMD} start ${SERVICE_NAME}`, 'Iniciando servicio')

  // Verificación final
  verifyServiceInstalled(SERVICE_NAME)
}

main().catch((err) => {
  console.error('💥 Error general en el script:', err)
  process.exit(1)
})
