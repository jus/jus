const fs              = require('fs')
const path            = require('path')
const walkdir         = require('walkdir')
const stringify       = JSON.stringify
const patterns        = require('./patterns')
const parsers         = require('require-dir')('./parsers')
const associate       = require('./associate')

module.exports = function jus (baseDir, cb) {
  const cacheFile = path.join(baseDir, '/.jus-cache.json')

  var areWeDoneInterval
  var emitter = walkdir(baseDir)
  var dataFiles = {}
  var pages = {}
  var images = {}
  var imageCount = 0

  try {
    var cache = require(cacheFile)
    console.log(`Found .jus-cache.json`)
  } catch (e) {
    console.log(`Processing files in ${path.basename(baseDir)}`)
  }

  function areWeDone() {
    if (imageCount !== Object.keys(images).length) return

    clearInterval(areWeDoneInterval)

    associate(pages, images, dataFiles)

    fs.writeFileSync(cacheFile, stringify({pages: pages, images: images}))

    cb(null, pages)
  }

  emitter.on('file', function (filepath, stat) {
    // Skip stuff like node_modules
    if (filepath.match(patterns.blacklist)) return

    // Extract metadata from HTML, HBS, and Markdown files
    if (filepath.match(patterns.page)) {
      var page = parsers.page(filepath, baseDir, cache)
      pages[page.href] = page
    }

    // Extract metadata from image files
    if (filepath.match(patterns.image)) {
      imageCount++
      parsers.image(filepath, baseDir, cache, function(err, image){
        images[image.href] = image
      })
    }

    // Extract metadata from JSON files
    if (filepath.match(patterns.dataFile)) {
      var data = parsers.data(filepath, baseDir)
      dataFiles[data.href] = data
    }
  })

  emitter.on('end', function () {
    // Call repeatedly until all images are processed
    areWeDoneInterval = setInterval(areWeDone, 10)
  })
}
