const fs = require('fs')
const path = require('path')
const getImageColors = require('get-image-colors')
const exif = require('exif-parser')
const imageSize = require('image-size')
const patterns = require('../patterns')

module.exports = function parseImage(filepath, baseDir, cache, callback) {
  var image = {
    title: null,
    href: filepath.replace(baseDir, ''),
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    parent: path.dirname(filepath.replace(baseDir, '')),
    processRelativePath: path.relative(process.cwd(), filepath),
    stats: fs.statSync(filepath)
  }

  image.title = path.basename(image.href).replace(patterns.image, '')

  // Look for cached image data
  if (cache && cache.images && cache.images[image.href]) {
    var cached = cache.images[image.href]
    // Dates that have been JSON stringified are weird. Use JSON.stringify to compare
    if (JSON.stringify(cached.stats.mtime) === JSON.stringify(image.stats.mtime)) {
      return callback(null, cached)
    }
  }

  image.dimensions = imageSize(image.processRelativePath)

  if (filepath.match(patterns.jpg)) {
    image.exif = exif.create(fs.readFileSync(image.processRelativePath)).parse()
  }

  getImageColors(image.processRelativePath, function(err, colors){
    if (err) return callback(err)
    image.colors = colors.map(color => color.hex())
    return callback(null, image)
  })

}
