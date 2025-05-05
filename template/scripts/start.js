const { spawn } = require('child_process')
const path = require('path')

// Configurable por entorno
const environment = process.env.NODE_ENV
if (!environment) {
  console.error('❌ Debes definir NODE_ENV (ej: NODE_ENV=test node start.js)')
  process.exit(1)
}

// Detectamos si --local fue pasado
const isLocal = process.argv.includes('--local')

// Ruta al builder
const buildScript = path.resolve(__dirname, './esbuild/debug.js')
// const buildScript = path.resolve(__dirname, './esbuild/release.js') // <-- si es release

// Ejecutar build
const buildProcess = spawn('node', [buildScript, ...(isLocal ? ['--local'] : [])], {
  stdio: 'inherit',
  env: process.env,
})

buildProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ El proceso de build falló con código ${code}`)
    process.exit(code)
  }

  console.log('✅ Build terminado. Ejecutando aplicación...\n')

  // Ejecutar run.js una vez finalizado el build
  const runScript = path.resolve(__dirname, './run.js')
  const runProcess = spawn('node', [runScript, ...(isLocal ? ['--local'] : [])], {
    stdio: 'inherit',
    env: process.env,
  })

  runProcess.on('exit', (runCode) => {
    if (runCode !== 0) {
      console.error(`❌ La aplicación terminó con código ${runCode}`)
      process.exit(runCode)
    }
  })
})
