const fs              = require('fs-extra')
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
      async.map(
        context.files,

        function(file, done) {

          // TODO: Change wording "isSqueezable" to "isRenderable" to avoid...
          // ... confusion since ALL files go through `squeeze()`
          if (file.isSqueezable) {
            fs.mkdirsSync(path.dirname(file.path.target.full))
            return file.render(context, (err, output) => {
              if (err) throw err
              fs.writeFileSync(file.path.target.full, output)
              return done(null)
            })
          }

          if (!file.isRemovable) {
            fs.mkdirsSync(path.dirname(file.path.target.full))
            fs.copySync(file.path.full, file.path.target.full)
          }

          return done(null)
        },

        function(err){
          if (err) throw err
          log(`Et Voila!`)
          process.exit()
        }
      )
    })
}
