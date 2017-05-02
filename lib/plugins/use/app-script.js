'use strict'

const path            = require('upath')
const browserify      = require('browserify')
const babelify        = require('babelify')
const preset_es2015   = require('babel-preset-es2015')
const preset_react    = require('babel-preset-react')
const concat          = require('concat-stream')

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'script',

  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.js', '.es6', '.es', '.jsx']
    let isFound = allowedExtensions.indexOf(extension) > -1

    // Ignore minified javascript files
    let isMinJS = !!filename.endsWith('.min.js')

    return callback(null, isFound && !isMinJS ? '.js' : false)
  },

  render (context, callback) {
    const file = this
    return browserify(file.path.processRelative)
      .transform(babelify, {presets: [preset_es2015, preset_react]})
      .bundle()
      .pipe(concat(function(buffer){
        return callback(null, buffer.toString())
      }))
      .on('error', function(err){
        console.error('uh oh, browserify problems', err)
      });
  }

}
