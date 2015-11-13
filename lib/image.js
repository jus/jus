const fs = require('fs')
const path = require('path')
const getImageColors = require('get-image-colors')
const exif = require('exif-parser')
const imageSize = require('image-size')
const patterns = require('./patterns')

module.exports = function parseImage(filepath, baseDir, callback) {
  var image = {
    href: filepath.replace(baseDir, ''),
    modified: fs.statSync(filepath).mtime,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    processRelativePath: path.relative(process.cwd(), filepath)
  }

  image.dimensions = imageSize(image.processRelativePath)

  if (filepath.match(patterns.jpg)) {
    image.exif = exif.create(fs.readFileSync(image.processRelativePath)).parse()
  }

  getImageColors(image.processRelativePath, function(err, colors){
    if (err) return callback(err)
    image.colors = colors
    return callback(null, image)
  })

}
