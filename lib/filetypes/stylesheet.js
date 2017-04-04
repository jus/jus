'use strict'

const path            = require('upath')
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Stylesheet extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
    this.isRenderable = true // means, will be render before written in targetDir
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.read()
    //    this.branch() // To spun other file (like minified or censored version)
    this.squeezed = true
  }
/*
  parse () {
    this.functions.parse(file, (err, output) => {
      if (err) throw err
      this.output  = output
    })
  }
*/
  render (context, callback) {
    context.file = this
    return this.functions.render(context, callback)
  }

  get isLess() {
    return this.path.ext.toLowerCase() === '.less'
  }

  get isSass() {
    return this.path.ext.toLowerCase() === '.sass'
  }

  get isSCSS() {
    return this.path.ext.toLowerCase() === '.scss'
  }

  get isStylus() {
    return this.path.ext.toLowerCase() === '.styl'
  }

  get isCSS() {
    return this.path.ext.toLowerCase() === '.css'
  }

}
