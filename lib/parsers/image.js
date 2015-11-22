const fs = require('fs')
const path = require('path')
const getImageColors = require('get-image-colors')
const exif = require('exif-parser')
const imageSize = require('image-size')
const patterns = require('../patterns')

module.exports = function parseImage(filepath, baseDir, cache, callback) {
  var image = {
    href: filepath.replace(baseDir, ''),
    modified: fs.statSync(filepath).mtime,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    processRelativePath: path.relative(process.cwd(), filepath),
    stats: fs.statSync(filepath)
  }

  // Skip EXIF parsing and color extraction if there's
  // a cached image object with the same modified time
  if (cache && cache[image.href]) {
    var cached = cache[image.href]
    // Dates that have been JSON stringified are no longer normal
    // date objects. To compare equality, we have stringify first...
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
