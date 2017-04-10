'use strict'

const path            = require('upath')
const browserify      = require('browserify')
const babelify        = require('babelify')
const preset_es2015   = require('babel-preset-es2015')
const preset_react    = require('babel-preset-react')
const concat          = require('concat-stream')

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 10,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'script',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.js', '.es6', '.es', '.jsx']
    return callback(null,
      allowedExtensions.indexOf(extension) > -1 && !filename.endsWith('.min.js'))
  },

  toExtension: (oldExt) => {
    // Simple rule, force to '.js'
    return '.js'
  },

  render: (file, context, callback) => {
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

/*
  branch: (file, callback) => {
    return callback(null, result)
  },

  translate: (file, callback) => {
    return callback(null, result)
  }
*/
}
