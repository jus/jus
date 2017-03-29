'use strict'

const fs              = require('fs')
const path            = require('upath')
const getImageColors  = require('get-image-colors')
const exif            = require('exif-parser')
const imageSize       = require('image-size')
const File            = require('./file')

module.exports = class Image extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.jpeg', '.jpg', '.svg', '.png', '.gif']
    var isSvgFont = false
    if (extension === 'svg') {
      isSvgFont = fs.readFileSync(filename, 'utf8').includes('</font>')
    }
    return callback(null,
      allowedExtensions.includes(extension) && !isSvgFont
    )
  }

  squeeze() {
    this.squeezed = false
    this.setDimensions()
    this.setExif()
    this.setColors()
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

  get isJPEG() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.jpg' || ext === '.jpeg'
  }

}
