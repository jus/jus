'use strict'

const path            = require('upath')

module.exports = {
  // ********
  // plugin
  // ********
  // Every attribute is optional except `check:`
  // ... all other attributs have failover defaults

  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 10,

  filetype: 'image',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.jpeg', '.jpg', '.svg', '.png', '.gif']
    var isSvgFont = false
    if (extension === 'svg') {
      isSvgFont = fs.readFileSync(filename, 'utf8').indexOf('</font>') > -1
    }
    return callback(null,
      allowedExtensions.indexOf(extension) > -1 && !isSvgFont )
  },
/*
  // default to `newExt = oldExt`, if function absent
  toExt: (oldExt) => {
    var newExt = oldExt
    return newExt
  },
*/
  mine: (file, callback) => {
    file.setDimensions()
    file.setExif()
    file.setColors()

//    this.squeezed = true // Comment when "setColors()" because is set inside
    return callback(null, true)
  }

/*
  transform: (file, callback) => {
    return callback(null, result)
  },

  branch: (file, callback) => {
    return callback(null, result)
  }
*/
}
