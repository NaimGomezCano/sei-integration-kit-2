var Service = require('node-windows').Service
require('dotenv').config({ path: __dirname + '/.env.test' })

// Crear el servicio
var svc = new Service({
  name: 'Temas2',
  description: 'Temas2',
  script: 'C:\\Program Files\\Seidor\\SEI-SF-INTEGRATION\\test\\dist\\app.js', // Asegúrate de poner el archivo correcto
  logpath: 'C:\\Program Files\\Seidor\\SEI-SF-INTEGRATION\\test\\dist',
  // execPath: 'C:\\Program Files\\nodejs14\\node.exe' // solo si necesitas una versión específica de Node
})

// Eventos
svc.on('install', function () {
  console.log('Servicio instalado, iniciando...')
  svc.start()
})

svc.on('start', function () {
  console.log('Servicio iniciado correctamente.')
})

svc.on('error', function (err) {
  console.error('Error al instalar o iniciar el servicio:', err)
})

svc.uninstall()
//svc.install()
