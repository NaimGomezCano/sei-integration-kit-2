import { $ } from 'bun'
import { env } from '../../../src/env'

try {
  const nssm = 'resources/win-service-manager/win64/nssm.exe'

  const envMode = env.NODE_ENV

  try {
    let serviceStatus = await $`${nssm} status ${env.SC_NAME}`.text()
    serviceStatus = serviceStatus.trim().replaceAll('\n', '')

    console.log(`\n-----------------------------------------------------------`)
    console.log(`\n Current service status:   ${serviceStatus}\n`)
    console.log(`-----------------------------------------------------------`)
  } catch (error: any) {
    throw new Error(`Service ${env.SC_NAME} does not exits or it's not running`)
  }

  switch (envMode) {
    case 'test':
      console.log('Editing test service...')
      break
    case 'production':
      console.warn('Editing production service...')
      break
    default:
      throw new Error('Unknown environment')
  }

  console.log('PD: If you dont see any windows pop up, please DO NOT use terminal in administator mode.')

  await $`${nssm} edit ${env.SC_NAME}`

  console.log(`
  

███████ ██    ██  ██████  ██████ ███████ ███████ ███████
██      ██    ██ ██      ██      ██      ██      ██     
███████ ██    ██ ██      ██      █████   ███████ ███████
     ██ ██    ██ ██      ██      ██           ██      ██            
███████  ██████   ██████  ██████ ███████ ███████ ███████ 
      
    
    `)
} catch (error: any) {
  console.warn(`
Warning - Service deployed but the status could not be checked. Please check the status manually in the services panel or logs.
    
Message: ${error.message}
`)
}
