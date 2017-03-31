'use strict'

const fs              = require('fs')
const path            = require('upath')
const myth            = require('myth')
const File            = require('./file')

module.exports = class StylesheetCSS extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.setTargetPathsAndHref(sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.css']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  }

  setTargetPathsAndHref(sourceDir, targetDir) {
    var targetExt = this.path.ext.toLowerCase()
    var targetFull = this.path.full
      .replace(sourceDir, targetDir)
      .replace(this.path.ext, targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  squeeze() {
    this.squeezed = false
    this.isSqueezable = true // means, will be render before written in targetDir
    this.read()
    this.squeezed = true
  }

  render(context, done) {
    let output

    if (this.isCSS) {
      output = myth(this.input, {source: this.path.full})
      return done(null, output)
    }

    return done(null, this.input)
  }

  get isCSS() {
    return this.path.ext.toLowerCase() === '.css'
  }

}
