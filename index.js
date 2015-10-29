const walkdir = require('walkdir')

const patterns = require('./lib/patterns')
const deriveSections = require('./lib/sections')
const parsePage = require('./lib/page')
const parseImage = require('./lib/image')
const attachImagesToPages = require('./lib/page-images')

module.exports = function juicer (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var pages = {}
  var imageCount = 0
  var images = {}

  emitter.on('file', function (filepath, stat) {
    // Skip stuff like node_modules
    if (filepath.match(patterns.blacklist)) return

    // Extract metadata from HTML and Markdown files
    if (filepath.match(patterns.page)) {
      var page = parsePage(filepath, baseDir)
      pages[page.href] = page
    }

    // Extract metadata from image files
    if (filepath.match(patterns.image)) {
      imageCount++
      var image = parseImage(filepath, baseDir, function(err, image){
        images[image.href] = image

        // If this is the last image to be processed, we're done!
        if (Object.keys(images).length === imageCount) {
          attachImagesToPages(images, pages)
          cb(null, {sections: deriveSections(pages), pages: pages})
        }

      })
    }
  })

  emitter.on('end', function () {
    // No images, we're done!
    if (imageCount === 0) {
      cb(null, {sections: deriveSections(pages), pages: pages})
    }
  })
}
