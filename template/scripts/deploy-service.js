/*  deploy-service.js
    — Instala / reinicia el servicio con NSSM.
      Si el servicio no arranca, lanza la app directamente
      y deja fluir los logs en consola.                      */

const path = require('path')
const fs = require('fs')
const { execSync, exec } = require('child_process')
const isAdmin = require('is-admin').default
const stripJsonComments = require('strip-json-comments').default

const NSSM_CMD = 'nssm'

/** Ejecuta un comando y devuelve { ok, stdout, stderr } */
function runCommand(command, description = '', options = {}) {
  try {
    console.log(`\n🚀 Ejecutando: ${description || command}`)
    const stdout = execSync(command, { stdio: 'pipe', ...options })
      .toString()
      .trim()
    if (stdout) console.log(`📤 Resultado:\n${stdout}`)
    else console.log('✅ Comando ejecutado sin salida.')
    return { ok: true, stdout, stderr: '' }
  } catch (err) {
    const stderr = (err.stderr ? err.stderr.toString() : err.message).trim()
    console.error(`❌ ERROR ejecutando: ${command}\n🧨 Detalle: ${stderr}`)
    return { ok: false, stdout: '', stderr }
  }
}

/** Lanza la app con node y retransmite stdout / stderr */
function runAppDirect(appPath, basePath, envVars) {
  const cmd = `node "${appPath}" --env=${envVars.NODE_ENV} --deploy=true`
  console.log(`\n🔁 Servicio no arrancó ➜ Ejecutando aplicación directamente\n${cmd}\n`)
  const child = exec(cmd, {
    cwd: basePath,
    env: { ...process.env, ...envVars },
    windowsHide: true,
  })

  child.stdout.on('data', (d) => process.stdout.write(`📗 ${d}`))
  child.stderr.on('data', (d) => process.stderr.write(`📕 ${d}`))
  child.on('exit', (c) => console.log(`\n🔚 Proceso finalizado con código: ${c}`))
}

/* Busca el primer directorio que contenga .git subiendo desde startPath */
function findGitRoot(startPath) {
  let current = path.resolve(startPath)
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) return current
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

function verifyServiceInstalled(displayNamePattern) {
  console.log(`🔍 Verificando instalación del servicio "${displayNamePattern}" (esperando 5 s)…`)
  setTimeout(() => {
    const psCommand = `powershell -Command "Get-Service | Where-Object { $_.DisplayName -like '*${displayNamePattern}*' } | ` + 'Format-List Name,DisplayName,Status"'
    exec(psCommand, { windowsHide: true }, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error(`⚠️ PowerShell lanzó un error:\n${stderr || error.message}`)
        return
      }
      if (!stdout.trim()) console.warn(`⚠️ No se detectó el servicio "${displayNamePattern}".`)
      else console.log(`✅ Servicio instalado correctamente:\n${stdout}`)
    })
  }, 5000)
}

async function main() {
  /* ---------- 0. permisos ---------- */
  console.log('🛡️ Verificando permisos de administrador…')
  if (!(await isAdmin())) {
    console.error('❌ Este script debe ejecutarse como administrador.')
    process.exit(1)
  }
  console.log('✅ Permisos OK.\n')

  /* ---------- 1. argumentos ---------- */
  const envArg = process.argv.find((a) => a.startsWith('--env='))
  const ENV = envArg ? envArg.split('=')[1] : process.env.NODE_ENV
  const SKIP_GIT = process.argv.includes('--skip-git') // ← NUEVO FLAG
  if (!ENV) {
    console.error('❌ Falta el entorno (--env=nombre o NODE_ENV).')
    process.exit(1)
  }
  console.log(`🌎 Entorno: "${ENV}"`)
  if (SKIP_GIT) console.log('⚠️  Validaciones Git desactivadas por --skip-git\n')

  /* ---------- 2. carga de configuración ---------- */
  const cfgPath = (p) => path.resolve(__dirname, `../config.${ENV}${p}.jsonc`)
  const configPath = cfgPath('')
  const localConfigPath = cfgPath('.local')

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config base no encontrada: ${configPath}`)
    process.exit(1)
  }

  let rawConfig = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf8')))
  if (fs.existsSync(localConfigPath)) {
    const local = JSON.parse(stripJsonComments(fs.readFileSync(localConfigPath, 'utf8')))
    rawConfig = { ...rawConfig, ...local }
  }

  const { APP_NAME, DEPLOY_DIR } = rawConfig
  if (!APP_NAME || !DEPLOY_DIR) {
    console.error('❌ APP_NAME o DEPLOY_DIR faltan en la config.')
    process.exit(1)
  }

  /* ---------- 3. paths ---------- */
  const SERVICE_NAME = `${APP_NAME}_${ENV}`
  const basePath = path.resolve(DEPLOY_DIR, 'SEI-SF-INTEGRATION', ENV)
  const appPath = path.resolve(basePath, 'dist', 'app.js')
  if (!fs.existsSync(appPath)) {
    console.error(`❌ No existe: ${appPath}`)
    process.exit(1)
  }

  /* ---------- 4. repo limpio y datos Git ---------- */
  let gitInfo = {}
  if (!SKIP_GIT) {
    const repoRoot = findGitRoot(__dirname)
    if (!repoRoot) {
      console.error(
        '❌ No se encontró un repositorio Git en este proyecto.\n' +
          '   El despliegue requiere commit y rama identificables.\n' +
          '   Usa --skip-git para omitir estas comprobaciones (bajo tu responsabilidad).'
      )
      process.exit(1)
    }

    const status = runCommand('git status --porcelain', 'Comprobando que el repositorio está limpio', {
      cwd: repoRoot,
    })
    if (!status.ok) process.exit(1)
    if (status.stdout) {
      console.error(
        '❌ El repositorio tiene cambios sin commit/stash.\n' + '   Por favor, realiza commit o stash antes de desplegar.\n' + '   O bien usa --skip-git si realmente deseas forzar el despliegue.'
      )
      process.exit(1)
    }

    const commit = runCommand('git rev-parse HEAD', 'Obteniendo hash de commit', { cwd: repoRoot })
    const branch = runCommand('git rev-parse --abbrev-ref HEAD', 'Obteniendo rama actual', {
      cwd: repoRoot,
    })
    if (!commit.ok || !branch.ok) process.exit(1)

    gitInfo = { GIT_COMMIT: commit.stdout, GIT_BRANCH: branch.stdout }
  }

  /* ---------- 5. variables de entorno ---------- */
  const envVars = {
    ...Object.fromEntries(Object.entries(rawConfig).map(([k, v]) => [k, String(v)])),
    NODE_ENV: ENV,
    IS_DEPLOY: 'true',
    ...gitInfo, // solo se añade si existen
  }

  /* ---------- 6. reinstalación ---------- */
  runCommand(`${NSSM_CMD} stop ${SERVICE_NAME}`, `Deteniendo ${SERVICE_NAME}`)
  runCommand(`${NSSM_CMD} remove ${SERVICE_NAME} confirm`, `Eliminando ${SERVICE_NAME}`)

  const dotenvPath = path.resolve(basePath, 'dist', '.env.deploy')
  fs.writeFileSync(
    dotenvPath,
    Object.entries(envVars)
      .map(([n, v]) => `${n}=${v.replace(/\n/g, '\\n')}`)
      .join('\n'),
    'utf8'
  )
  console.log(`✅ .env.deploy generado en ${dotenvPath}`)

  runCommand(`${NSSM_CMD} install ${SERVICE_NAME} "${process.execPath}" "${appPath}" --env=${ENV} --deploy=true`, 'Instalando servicio')
  runCommand(`${NSSM_CMD} set ${SERVICE_NAME} AppDirectory "${basePath}"`, 'Set AppDirectory')
  runCommand(
    `${NSSM_CMD} set ${SERVICE_NAME} AppEnvironmentExtra "${Object.entries(envVars)
      .map(([n, v]) => `${n}=${v}`)
      .join(' ')}"`,
    'Set AppEnvironmentExtra'
  )

  /* ---------- 7. arranque y fallback ---------- */
  const { ok: started } = runCommand(`${NSSM_CMD} start ${SERVICE_NAME}`, 'Iniciando servicio')

  if (!started) {
    /* cualquier error ⇒ ejecuta la app directamente */
    runAppDirect(appPath, basePath, envVars)
    return
  }

  console.log('✅ Servicio iniciado correctamente.')
  verifyServiceInstalled(SERVICE_NAME)
}

main().catch((err) => {
  console.error('💥 Error general:\n', err)
  process.exit(1)
})
