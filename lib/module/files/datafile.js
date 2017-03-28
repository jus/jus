'use strict'

const fs              = require('fs')
const yaml            = require('js-yaml')
const snakeCase       = require('lodash').snakeCase
//const File            = require('./basefile')
const File            = require('../basefile')

module.exports = class datafile extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    if (this.isJSON) {
      // if not the first time, delete cache
      if (this.data) delete require.cache[require.resolve(this.path.full)]
      this.data = require(this.path.full)
    }
    if (this.isYML) this.data = yaml.safeLoad(fs.readFileSync(this.path.full, 'utf8'))
    this.squeezed = true
  }
/*
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
*/
  get isJSON() {
    return this.path.ext.toLowerCase() === '.json'
  }

  get isYML() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.yml' || ext === '.yaml'
  }
/*
  get keyName() {
    return snakeCase(`${this.path.dir}_${this.path.name}`)
  }
*/
}
