'use strict'

const path            = require('upath')
const myth            = require('myth')
const less            = require('less')
const sass            = require('node-sass')
const stylus          = require('stylus')

module.exports = {
  // ********
  // plugin
  // ********
  // Every attribute is optional except `check:`
  // ... all other attributs have failover defaults

  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 10,

  filetype: 'stylesheet',

  // calls back with a boolean indicating whether file class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css', '.less', '.sass', '.scss', '.styl', ]
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  toExt: (oldExt) => {
    return '.css' // force target extension
  },

  render: (context, callback) => {
    let file = context.file
    let output

    if (file.isCSS) {
      output = myth(file.input, {source: file.path.full})
      return callback(null, output)
    }

    if (file.isLess) {
      return less.render(file.input, {filename: file.path.full}, function(err, output){
        if (err) throw err
        return callback(null, output.css)
      })
    }

    if (file.isStylus) {
       output = stylus(file.input)
        .set('filename', file.path.full)
        .set('paths', [path.dirname(file.path.full)])
        .render()
      return callback(null, output)
    }

    if (file.isSass) {
      output = sass
        .renderSync({data: file.input, indentedSyntax: true})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    if (file.isSCSS) {
      output = sass
        .renderSync({data: file.input})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    return callback(null, file.input)
  }

/*
  branch: (file, callback) => {
    return callback(null, result)
  }
*/
}
