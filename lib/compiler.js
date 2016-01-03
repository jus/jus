const path     = require('path')
const inflect  = require('inflection').inflect
const jus      = require('./jus')
const log      = require('./log')

var compiler = module.exports = {}

compiler.start = (sourceDir, targetDir) => {

  jus(sourceDir, targetDir)
    .on('started', () => {
      log(`Juicing ${path.basename(sourceDir)}...`)
    })
    .on('file-add', (file) => {
      log(`  ${file.path.relative} added`, 'dim')
    })
    .on('squeezing', (files) => {
      log(`Squeezing ${files.length} ${inflect('file', files.length)}...`)
    })
    .on('squeezed', (context) => {
      context.files.forEach(file => file.write(context))
      log(`Et Voila!`)
      process.exit()
    })
}
