const { spawn } = require('child_process')

const temporal = spawn('temporal', ['server', 'start-dev'], {
  stdio: 'inherit',
  shell: true,
})


const temporal222 = spawn('temporal', ['server', 'start-dev', '--log-level', 'info'], {
  stdio: 'inherit',
  shell: true,
})
