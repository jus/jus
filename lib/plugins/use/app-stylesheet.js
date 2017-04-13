'use strict'

const path            = require('upath')
const myth            = require('myth')
const less            = require('less')
const sass            = require('node-sass')
const stylus          = require('stylus')

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'stylesheet',

  // calls back with a result indicating whether file class should process the given file.
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css', '.less', '.sass', '.scss', '.styl', ]
    let isFound = allowedExtensions.indexOf(extension) > -1

    // Ignore minified css files
    let isMinCSS = !!filename.endsWith('.min.css')

    return callback(null, isFound && !isMinCSS ? '.css' : false)
  },

  render (context, callback) {
    const file = this
    var output

    if (file.isCSS()) {
      output = myth(file.input, {source: file.path.full})
      return callback(null, output)
    }

    if (file.isLess()) {
      return less.render(file.input, {filename: file.path.full}, function(err, output){
        if (err) throw err
        return callback(null, output.css)
      })
    }

    if (file.isStylus()) {
       output = stylus(file.input)
        .set('filename', file.path.full)
        .set('paths', [path.dirname(file.path.full)])
        .render()
      return callback(null, output)
    }

    if (file.isSass()) {
      output = sass
        .renderSync({data: file.input, indentedSyntax: true})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    if (file.isSCSS()) {
      output = sass
        .renderSync({data: file.input})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    return callback(null, file.input)
  }

}
