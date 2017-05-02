'use strict'

const path            = require('upath')

module.exports = {
  // TODO: Consider moving these helpers to the `stylesheet` default plugin
  isLess () {
    return this.path.ext.toLowerCase() === '.less'
  },

  isSass () {
    return this.path.ext.toLowerCase() === '.sass'
  },

  isSCSS () {
    return this.path.ext.toLowerCase() === '.scss'
  },

  isStylus () {
    return this.path.ext.toLowerCase() === '.styl'
  },

  isCSS () {
    return this.path.ext.toLowerCase() === '.css'
  }

}
