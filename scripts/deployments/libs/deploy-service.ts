import { $, type BunFile } from 'bun'
import { env } from '../../../src/env'
import { removeSymbols } from './utils'

type WinService = {
  name: string
  exe: string
  exeDir: string
  displayName?: string
  description?: string
  startType?: 'SERVICE_AUTO_START' | 'SERVICE_DEMAND_START' | 'SERVICE_DISABLED' | 'SERVICE_DELAYED_AUTO_START'
  account?: {
    domain: string
    username: string
    password: string
  }
  dependencies?: string
  serviceType?: 'SERVICE_WIN32_OWN_PROCESS' | 'SERVICE_INTERACTIVE_PROCESS'
  // logRotation?: 0 | 1
  // logRotationOnline?: 0 | 1
  logMaxSize?: number
  logMaxTime?: number
  logErrorFile?: string
  logOutputFile?: string
}

/****************************************************************************************
  Constants
*****************************************************************************************/

const nssm = 'resources/win-service-manager/win64/nssm.exe'
const baseDir = import.meta.dir.split('\\').slice(0, -3).join('\\')
const envMode = env.NODE_ENV

/****************************************************************************************
  Variables
*****************************************************************************************/

let appName: string
let appDir: string
let buildMsg: string
let envFile: string
let envLocalFile: string
let serviceStatus: string | null = null

/****************************************************************************************
  Setup
*****************************************************************************************/

await $`bun exec scripts/deployments/cmd/setupLogsFolders.bat` //Path from root

/****************************************************************************************
  Main
*****************************************************************************************/
try {
  switch (envMode) {
    case 'test':
      envLocalFile = '.env.test.local'
      envFile = '.env.test'
      appName = 'app-test-x64.exe'
      appDir = baseDir + '\\bin\\test'
      buildMsg = '🔨 Building executable for TEST environment...'
      console.log(`
      

██████  ███████ ██████  ██       ██████  ██    ██     ████████ ███████ ███████ ████████ 
██   ██ ██      ██   ██ ██      ██    ██  ██  ██         ██    ██      ██         ██    
██   ██ █████   ██████  ██      ██    ██   ████          ██    █████   ███████    ██    
██   ██ ██      ██      ██      ██    ██    ██           ██    ██           ██    ██    
██████  ███████ ██      ███████  ██████     ██           ██    ███████ ███████    ██    


      `)
      break

    case 'production':
      envLocalFile = '.env.production.local'
      envFile = '.env.production'
      appName = 'app-prod-x64.exe'
      appDir = baseDir + '\\bin\\production'
      buildMsg = '⚒️ Building executable for PRODUCTION environment...'

      console.log(`
    

██████  ███████ ██████  ██       ██████  ██    ██     ██████  ██████   ██████  ██████  ██    ██  ██████ ████████ ██  ██████  ███    ██ 
██   ██ ██      ██   ██ ██      ██    ██  ██  ██      ██   ██ ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ████   ██ 
██   ██ █████   ██████  ██      ██    ██   ████       ██████  ██████  ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██ ██  ██ 
██   ██ ██      ██      ██      ██    ██    ██        ██      ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██  ██ ██ 
██████  ███████ ██      ███████  ██████     ██        ██      ██   ██  ██████  ██████   ██████   ██████    ██    ██  ██████  ██   ████  


      `)
      break

    default:
      throw new Error('Unknown environment')
  }

  const appExe = `${appDir}\\${appName}`
  const outputLog = `${appDir}\\logs\\service\\outputs`
  const errorLog = `${appDir}\\logs\\service\\errors`

  try {
    const serviceRawStatus = await $`${nssm} status ${env.SC_NAME}`.text()
    serviceStatus = removeSymbols(serviceRawStatus, ['_'])

    console.log(`\n-----------------------------------------------------------`)
    console.log(`Service ID:       ${env.SC_NAME}`)
    console.log(`Service status:   ${serviceStatus}`)
    console.log(`Service path:     ${appExe}`)
    console.log(`-----------------------------------------------------------\n`)
    try {
      if (serviceStatus != 'SERVICE_STOPPED') {
        console.log('Service is active, stopping service in order to build...\n')

        await $`${nssm} stop ${env.SC_NAME}`

        console.log('\nService stopped!\n')
      }
    } catch (error: any) {
      throw new Error(`Error stopping service - ${error.message}`)
    }
  } catch (error: any) {
    console.log('Service is not running or not found, proceeding to build...\n')
  }

  console.log(buildMsg + '\n')

  if (envMode == 'test') await $`bun build --compile --minify --sourcemap src/index.ts --outfile bin/test/app-test-x64`
  if (envMode == 'production') await $`bun build --compile --minify --sourcemap src/index.ts --outfile bin/production/app-prod-x64`

  if (!serviceStatus) {
    console.log('\n *** Service not found, installing for the first time... ***')

    await $`${nssm} install ${env.SC_NAME} ${appExe}`
  }

  console.log('\n*** Updating service... ***')

  let service: WinService = {
    name: env.SC_NAME!!,
    exe: appExe,
    exeDir: appDir,
    description: env.SC_DESCRIPTION ? env.SC_DESCRIPTION : env.SC_NAME,
    displayName: env.SC_DISPLAY_NAME ? env.SC_DISPLAY_NAME : env.SC_NAME,
    dependencies: env.SC_DEPENDENCIES,
    startType: env.SC_START ? env.SC_START : 'SERVICE_DELAYED_AUTO_START',
    logMaxSize: env.SC_LOG_MAX_SIZE ? env.SC_LOG_MAX_SIZE : 1048576,
    logMaxTime: env.SC_LOG_MAX_TIME ? env.SC_LOG_MAX_TIME : 86400,
    logErrorFile: env.SC_LOG_ERROR ? env.SC_LOG_ERROR : errorLog + '\\error.txt',
    logOutputFile: env.SC_LOG_OUTPUT ? env.SC_LOG_OUTPUT : outputLog + '\\output.txt',
  }

  console.log(`

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░█▀▀░█▀▀░█▀▄░█░█░▀█▀░█▀▀░█▀▀░░░█▀▀░█▀▀░▀█▀░▀█▀░▀█▀░█▀█░█▀▀░█▀▀░░░░
░▀▀█░█▀▀░█▀▄░▀▄▀░░█░░█░░░█▀▀░░░▀▀█░█▀▀░░█░░░█░░░█░░█░█░█░█░▀▀█░░▀░
░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀░▀▀▀░▀▀▀░░░▀▀▀░▀▀▀░░▀░░░▀░░▀▀▀░▀░▀░▀▀▀░▀▀▀░░▀░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  `)

  console.log('**************************************************************************\n')

  await $`${nssm} set ${service.name} Application ${service.exe}`
  await $`${nssm} set ${service.name} AppDirectory ${service.exeDir}`
  await $`${nssm} set ${service.name} Description ${service.description}`
  await $`${nssm} set ${service.name} DisplayName ${service.displayName}`
  await $`${nssm} set ${service.name} Start ${service.startType}`
  await $`${nssm} set ${service.name} AppRotateFiles 1` //Enable log rotation
  await $`${nssm} set ${service.name} AppRotateOnline 1` // Enable online log rotation
  await $`${nssm} set ${service.name} AppRotateBytes ${service.logMaxSize}`
  await $`${nssm} set ${service.name} AppRotateSeconds ${service.logMaxTime}`

  if (service.logErrorFile) {
    await $`${nssm} set ${service.name} AppStderr ${service.logErrorFile}`
  }

  if (service.logOutputFile) {
    await $`${nssm} set ${service.name} AppStdout ${service.logOutputFile}`
  }

  const depList = service.dependencies?.split(',')
  let deps = ''
  if (depList && depList.length > 0) {
    for (const dep of depList) {
      deps += `${dep.trim() + '\n'}`
    }
    await $`${nssm} set ${env.SC_NAME} DependOnService ${deps}`
  }

  console.log('\n**************************************************************************')

  console.log(`

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░█▀▀░█▀█░█░█░▀█▀░█▀▄░█▀█░█▀█░█▄█░█▀▀░█▀█░▀█▀░░░█░█░█▀█░█▀▄░▀█▀░█▀█░█▀▄░█░░░█▀▀░█▀▀░░░░
░█▀▀░█░█░▀▄▀░░█░░█▀▄░█░█░█░█░█░█░█▀▀░█░█░░█░░░░▀▄▀░█▀█░█▀▄░░█░░█▀█░█▀▄░█░░░█▀▀░▀▀█░░▀░
░▀▀▀░▀░▀░░▀░░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀░▀░░▀░░░░░▀░░▀░▀░▀░▀░▀▀▀░▀░▀░▀▀░░▀▀▀░▀▀▀░▀▀▀░░▀░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

  `)

  console.log('**************************************************************************\n')

  let file: BunFile

  if (await Bun.file(envLocalFile).exists()) {
    file = Bun.file(envLocalFile)
  } else {
    file = Bun.file(envFile)
  }

  const text = await file.text()
  let serviceEnvs = ''

  text.split('\n').map(async (line) => {
    const [key, value] = line.split('=')
    if (key && value) {
      if (key.trim().startsWith('#')) return
      if (!value.trim()) return
      serviceEnvs += `${key.trim()}=${value.trim().replaceAll('"', '').replaceAll("'", '')}\n`
      console.log(`${key.trim()} = ${value.trim().replaceAll('"', '').replaceAll("'", '')}`)
    }
  })

  console.log('\n**************************************************************************\n')

  await $`${nssm} set ${env.SC_NAME} AppEnvironmentExtra ${serviceEnvs}`

  console.log('\nEnvironment variables successfully set!\n')

  try {
    await $`${nssm} start ${env.SC_NAME}`

    console.log('\n*** SERVICE STARTED! ***')

    console.log(`
  

███████ ██    ██  ██████  ██████ ███████ ███████ ███████
██      ██    ██ ██      ██      ██      ██      ██     
███████ ██    ██ ██      ██      █████   ███████ ███████
     ██ ██    ██ ██      ██      ██           ██      ██            
███████  ██████   ██████  ██████ ███████ ███████ ███████ 
      
    
    `)
  } catch (error: any) {
    throw new Error(`Error starting service (Service may already be running, please check in the Windows Services) - ${error.message}`)
  }
} catch (error: any) {
  console.error(`
  

███████ ██████  ██████   ██████  ██████  
██      ██   ██ ██   ██ ██    ██ ██   ██ 
█████   ██████  ██████  ██    ██ ██████  
██      ██   ██ ██   ██ ██    ██ ██   ██ 
███████ ██   ██ ██   ██  ██████  ██   ██ 
    
  Message: ${error.message}

  `)
}
