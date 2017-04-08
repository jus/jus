'use strict'

const path            = require('upath')

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 10,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'image',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.jpeg', '.jpg', '.svg', '.png', '.gif']
    var isSvgFont = false
    if (extension === 'svg') {
      isSvgFont = fs.readFileSync(filename, 'utf8').indexOf('</font>') > -1
    }
    return callback(null, allowedExtensions.indexOf(extension) > -1 && !isSvgFont)
  },

  parse: (file, callback) => {
    // Overrides default because setColors is asynchrounous
    file.isPluginAsynchronous = true
    file.setDimensions()
    file.setExif()
    file.setColors()
    return callback(null)
  }

}
