'use strict'

const path            = require('upath')
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Script extends File {

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

  render (context, callback) {
    this.functions.render(this, callback) // scripts do not need context. Need the file!
  }

/*
  // For optional render, like optional extension
  translate () {
    this.functions.render(file, (err, result) => {
      if (err) throw err
      return result
    })
  }
*/
}
