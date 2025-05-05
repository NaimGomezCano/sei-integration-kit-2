// esbuild.generate.js
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const DECORATORS = ['RegisterRoute', 'RegisterErrorStrategy', 'RegisterSchedules']

function generateAutoImports() {
  const SRC_DIR = path.resolve(__dirname, '../', '../', 'src')
  const IMPORT_FILE = path.join(SRC_DIR, '__auto_imports__.ts')

  const files = glob.sync(`${SRC_DIR}/**/*.ts`)

  const isDecorated = (content) =>
    DECORATORS.some((decorator) => {
      const regex = new RegExp(`^\\s*@${decorator}\\b`, 'm')
      return regex.test(content)
    })

  const matchingFiles = files.filter((file) => {
    const content = fs.readFileSync(file, 'utf8')
    return isDecorated(content)
  })

  const imports = matchingFiles.map((file) => {
    const relative = './' + path.relative(SRC_DIR, file).replace(/\\/g, '/')
    return `import '${relative}';`
  })

  fs.writeFileSync(IMPORT_FILE, imports.join('\n'), 'utf8')
  console.log(`✅ __auto_imports__.ts generado con ${matchingFiles.length} archivos decorados.`)
  return IMPORT_FILE
}

module.exports = generateAutoImports
