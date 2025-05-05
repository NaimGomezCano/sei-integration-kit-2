const { Service } = require('node-windows')
const path = require('path')

const svc = new Service({
  name: 'MiAppNode',
  description: 'Mi Aplicación Node.js como Servicio de Windows',
  script: path.join(__dirname, '../dist', 'index.js'),
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
})

svc.on('install', () => {
  svc.start()
  console.log('Servicio instalado y ejecutándose correctamente.')
})

svc.on('error', (err) => {
  console.error('Error:', err)
})

svc.install()
