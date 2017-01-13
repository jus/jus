const path     = require('upath')
const async    = require('async')
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
      // Remove developing 404 page
      context.files = context.files.filter(f =>
        f.path.base !== 'hard-to-guess-404-filename.html'
      )

      async.map(
        context.files,

        function(file, done) {
          return file.write(context, done)
        },

        function(err){
          if (err) throw err
          log(`Et Voila!`)
          process.exit()
        }
      )
    })
}
