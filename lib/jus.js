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
    if (filepath.match(patterns.blacklist)) return

    if (filepath.match(patterns.page)) {
      var page = parsers.page(filepath, baseDir, cache)
      pages[page.href] = page
    }

    if (filepath.match(patterns.image)) {
      imageCount++
      parsers.image(filepath, baseDir, cache, function(err, image){
        images[image.href] = image
      })
    }

    if (filepath.match(patterns.dataFile)) {
      var data = parsers.data(filepath, baseDir)
      dataFiles[data.href] = data
    }
  })

  emitter.on('end', function () {
    areWeDoneInterval = setInterval(areWeDone, 10)
  })
}
