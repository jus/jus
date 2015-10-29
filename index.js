const walkdir = require('walkdir')
const titlecase = require('titlecase').toLaxTitleCase

const patterns = require('./lib/patterns')
const parsePage = require('./lib/page')

module.exports = function juicer (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var result = {
    sections: {},
    pages: {}
  }

  emitter.on('file', function (filepath, stat) {

    // Skip the README
    if (filepath.match(/readme\.md/i)) return

    // Skip node_modules
    if (filepath.match(/node_modules/)) return

    //
    if (filepath.match(patterns.page)) {
      var page = parsePage(filepath, baseDir)
      result.pages[page.href] = page
    }

  })

  emitter.on('end', function () {

    Object.keys(result.pages).forEach(function(href){
      var page = result.pages[href]

      // Pages in top-level directory don't have a section
      if(!page.section) return

      // Create section if it doesn't already exist
      if (!result.sections[page.section]) {
        result.sections[page.section] = {
          title: titlecase(page.section),
          pages: {}
        }
      }

      // Add page to section
      result.sections[page.section].pages[page.href] = page
    })

    cb(null, result)
  })

}
