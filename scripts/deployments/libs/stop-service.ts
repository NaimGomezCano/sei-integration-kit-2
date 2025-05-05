import { $ } from 'bun'
import { env } from '../../../src/env'

try {
  const nssm = 'resources/win-service-manager/win64/nssm.exe'

  const envMode = env.NODE_ENV

  switch (envMode) {
    case 'test':
      console.log(`
      

███████ ████████  ██████  ██████      ████████ ███████ ███████ ████████ 
██         ██    ██    ██ ██   ██        ██    ██      ██         ██    
███████    ██    ██    ██ ██████         ██    █████   ███████    ██    
     ██    ██    ██    ██ ██             ██    ██           ██    ██    
███████    ██     ██████  ██             ██    ███████ ███████    ██    


    `)
      break
    case 'production':
      console.log(`
    
        
███████ ████████  ██████  ██████      ██████  ██████   ██████  ██████  ██    ██  ██████ ████████ ██  ██████  ███    ██ 
██         ██    ██    ██ ██   ██     ██   ██ ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ████   ██ 
███████    ██    ██    ██ ██████      ██████  ██████  ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██ ██  ██ 
     ██    ██    ██    ██ ██          ██      ██   ██ ██    ██ ██   ██ ██    ██ ██         ██    ██ ██    ██ ██  ██ ██ 
███████    ██     ██████  ██          ██      ██   ██  ██████  ██████   ██████   ██████    ██    ██  ██████  ██   ████ 


`)

      break
    default:
      throw new Error('Unknown environment')
  }

  try {
    let serviceStatus = await $`${nssm} status ${env.SC_NAME}`.text()
    serviceStatus = serviceStatus.trim().replaceAll('\n', '')

    console.log(`\n-----------------------------------------------------------`)
    console.log(`\n Current service status:   ${serviceStatus}\n`)
    console.log(`-----------------------------------------------------------`)

    console.log('Stopping service...')
    await $`${nssm} stop ${env.SC_NAME}`
  } catch (error) {
    throw new Error(`Service ${env.SC_NAME} does not exits or it's not running`)
  }

  console.log('\nService stopped!')

  console.log(`


███████ ██    ██  ██████  ██████ ███████ ███████ ███████
██      ██    ██ ██      ██      ██      ██      ██     
███████ ██    ██ ██      ██      █████   ███████ ███████
     ██ ██    ██ ██      ██      ██           ██      ██            
███████  ██████   ██████  ██████ ███████ ███████ ███████ 
    
  
`)
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
