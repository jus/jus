'use strict'

const fs              = require('fs')
const path            = require('upath')
const browserify      = require('browserify')
const babelify        = require('babelify')
const preset_es2015   = require('babel-preset-es2015')
const preset_react    = require('babel-preset-react')
const concat          = require('concat-stream')
const File            = require('../file')

module.exports = class Script extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    // Four chained steps: browserify > babelify > bundle > pipe
    const browserifyOutput = browserify(this.path.processRelative)
      .on('error', function(err){
        console.error('Oops! ..., browserify() problem in: ', __filename , err)
        /*
        console.error('*******************')
        console.error('this.path.processRelative = ', this.path.processRelative)
        console.error('*******************')
        */
      });
    const babelifyOutput = browserifyOutput
      .transform(babelify, {presets: [preset_es2015, preset_react]})
      .on('error', function(err){
        console.error('Oops! ..., transform() problem in: ', __filename , err)
        /*
        console.error('*******************')
        console.error('browserifyOutput = ', browserifyOutput)
        console.error('*******************')
        */
      });
    const bundleOutput = babelifyOutput
      .bundle()
      .on('error', function(err){
        console.error('Oops! ..., bundle() problem in: ', __filename , err)
        /*
        console.error('*******************')
        console.error('babelifyOutput = ', babelifyOutput)
        console.error('*******************')
        */
      });
    const pipeOutput = bundleOutput.pipe(concat(function(buffer){
        return done(null, buffer.toString())
      }))
      .on('error', function(err){
        console.error('Oops! ..., pipe() problem in: ', __filename , err)
        /*
        console.error('*******************')
        console.error('bundleOutput = ', bundleOutput)
        console.error('*******************')
        */
      });
    return pipeOutput
  }

}
