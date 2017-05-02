'use strict'

const path            = require('upath')

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'image',

  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.jpeg', '.jpg', '.svg', '.png', '.gif']
    var isSvgFont = false
    if (extension === 'svg') {
      isSvgFont = fs.readFileSync(filename, 'utf8').indexOf('</font>') > -1
    }
    return callback(null, allowedExtensions.indexOf(extension) > -1 && !isSvgFont)
  },

  parse (file, callback) {
    // Overrides default because setColors is asynchrounous
    file.isPluginAsynchronous = true
    file.setDimensions()
    file.setExif()
    file.setColors()
    return callback(null)
  }

}
