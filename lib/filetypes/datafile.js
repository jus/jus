'use strict'

const path            = require('upath')
const snakeCase       = require('lodash').snakeCase
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Datafile extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.filepath = filepath
    this.sourceDir = sourceDir
    this.targetDir = targetDir
    this.type = this.constructor.name.toLowerCase()
    this.typePlural = pluralize(this.type)
  }

  squeeze () {
    this.squeezed = false
    this.setStats()
    this.parse()
//    this.transform() // To apply "transforms/filters"
//    this.mine() // To apply "mine/extract" data
//    this.branch() // To spun other file (like minified or censored version)
    this.squeezed = true
  }

  parse () {
    this.functions.parse(this, (err, result) => {
      if (err) throw err
      this.data = result
    })
  }

/*
  render () {
    this.functions.render(file, (err, result) => {
      if (err) throw err
      return result
    })
  }

  // For optional render, like optional extension
  translate () {
    this.functions.render(file, (err, result) => {
      if (err) throw err
      return result
    })
  }
*/
  distinctContextualize (ctx) {
    // Attach this datafile data to all pages in the same directory
    ctx.pages.forEach(page => {
      if (page.path.dir === this.path.dir) {
        if (!page.data) page.data = {} // It is the first of its type in the page
        page.data[this.path.name] = this.data
      }
    })
  }

  distinctDecontextualize (ctx) {
    // Remove this datafile data from all pages in the same directory
    ctx.pages.forEach(page => {
      if (page.path.dir === this.path.dir && page.data) {
        delete page.data[this.path.name]
      }
    })
  }

  get keyName() {
    return snakeCase(`${this.path.dir}_${this.path.name}`)
  }

}
