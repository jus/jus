const fs = require('fs')
const path = require('path')
const getPixels = require('get-pixels')
const palette = require('get-rgba-palette')

const patterns = require('./patterns')

module.exports = function parseImage(filepath, baseDir, callback) {
  var image = {
    href: filepath.replace(baseDir, ''),
    modified: fs.statSync(filepath).mtime,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, '')
  }

  // SVGs don't need their palettes extracted
  if (!filepath.match(patterns.bitmap)) {
    return callback(null, image)
  }

  // Extract palettes from bitmaps
  getPixels(filepath, function(err, pixels) {
    if (err) return callback(err)
    image.palette = palette(pixels.data, 5)
    return callback(null, image)
  })
}
