const fs = require('fs')
const path = require('path')
const walkdir = require('walkdir')

const patterns = require('./lib/patterns')
const parseJSON = require('./lib/parsers/json')
const parsePage = require('./lib/parsers/page')
const parseImage = require('./lib/parsers/image')
const associateImagesWithPages = require('./lib/page-images')
const associateDataWithPages = require('./lib/page-data')
const deriveSections = require('./lib/sections')

module.exports = function juicer (baseDir, cb) {
  var tryToWrapItUpInterval
  var emitter = walkdir(baseDir)
  var data = {}
  var pages = {}
  var images = {}
  var imageCount = 0
  var cacheFile = path.join(baseDir, '/.juicer-cache.json')
  if (fs.existsSync(cacheFile)) var cache = require(cacheFile)

  function tryToWrapItUp() {
    // Wait until all asynchronous image processing is complete
    if (imageCount !== Object.keys(images).length) return

    clearInterval(tryToWrapItUpInterval)

    // Rewrite the cache file
    fs.writeFileSync(cacheFile, JSON.stringify(images, null, 2))

    associateImagesWithPages(images, pages)

    associateDataWithPages(data, pages)

    // Call back with the fully juiced tree
    cb(null, {
      sections: deriveSections(pages),
      pages: pages
    })
  }

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
      parseImage(filepath, baseDir, cache, function(err, image){
        images[image.href] = image
      })
    }

    // Extract metadata from JSON files
    if (filepath.match(patterns.json)) {
      var json = parseJSON(filepath, baseDir)
      data[json.href] = json
    }

  })

  emitter.on('end', function () {
    // Call repeatedly until all images are processed
    tryToWrapItUpInterval = setInterval(tryToWrapItUp, 10)
  })
}
