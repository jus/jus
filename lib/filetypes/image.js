'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const pluralize       = require('inflection').pluralize
const getImageColors  = require('get-image-colors')
const exif            = require('exif-parser')
const imageSize       = require('image-size')
const File            = require('../file')

module.exports = class Image extends File {

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
//    this.transform() // To apply "transforms/filters"
    this.mine() // To apply "mine/extract" data
//    this.branch() // To spun other file (like minified or censored version)
//    this.squeezed = true
  }

  mine () {
    this.functions.mine(this, (err, result) => {
      if (err) throw err
      return result
    })
  }

  setDimensions() {
    this.dimensions = imageSize(this.path.processRelative)
  }

  setExif() {
    if (!this.isJPEG) return
    this.exif = exif.create(fs.readFileSync(this.path.processRelative)).parse()
  }

  setColors() {
    var self = this
    getImageColors(this.path.processRelative, function(err, colors){
      if (err) throw err
      self.colors = colors.map(color => color.hex())

      self.squeezed = true
    })
  }

  distinctContextualize (ctx) {
    // Attach this image to all pages in the same directory
    ctx.pages.forEach(page => {
      if (page.path.dir === this.path.dir) {
        if (!page[this.typePlural]) page[this.typePlural] = {} // It is the first of its type in the page
        page[this.typePlural][this.path.name] = this
      }
    })
  }

  distinctDecontextualize (ctx) {
    // Remove this image from all pages in the same directory
    ctx.pages.forEach(page => {
      if (page.path.dir === this.path.dir && page[this.typePlural]) {
        delete page[this.typePlural][this.path.name]
      }
    })
  }

  get isJPEG() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.jpg' || ext === '.jpeg'
  }

}
