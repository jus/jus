'use strict'

const path            = require('upath')
const myth            = require('myth')
const less            = require('less')
const sass            = require('node-sass')
const stylus          = require('stylus')

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 10,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'stylesheet',

  // calls back with a boolean indicating whether file class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css', '.less', '.sass', '.scss', '.styl', ]
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  toExtension: (oldExt) => {
    // Simple rule, force to '.css'
    return '.css'
  },

  render: (file, context, callback) => {
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

}
