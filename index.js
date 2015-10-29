const walkdir = require('walkdir')

const patterns = require('./lib/patterns')
const deriveSections = require('./lib/sections')
const parsePage = require('./lib/page')

module.exports = function juicer (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var pages = {}

  emitter.on('file', function (filepath, stat) {
    if (filepath.match(patterns.blacklist)) return

    if (filepath.match(patterns.page)) {
      var page = parsePage(filepath, baseDir)
      pages[page.href] = page
    }
  })

  emitter.on('end', function () {
    cb(null, {sections: deriveSections(pages), pages: pages})
  })
}
