'use strict'

const fs              = require('fs')
const getImageColors  = require('get-image-colors')
const exif            = require('exif-parser')
const imageSize       = require('image-size')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Image extends File {
  constructor(filepath, baseDir) {
    super(filepath, baseDir)
  }

  squeeze() {
    this.squeezed = false
    this.dimensions = this.getDimensions()
    this.exif = this.getExif()
    this.getColors()
  }

  getDimensions() {
    return imageSize(this.path.processRelative)
  }

  getExif() {
    if (this.isJPEG) return exif.create(fs.readFileSync(this.path.processRelative)).parse()
  }

  getColors() {
    var self = this
    getImageColors(this.path.processRelative, function(err, colors){
      if (err) throw err
      self.colors = colors.map(color => color.hex())
      self.squeezed = true
    })
  }

  get isJPEG() {
    return !!this.path.ext.match(patterns.jpg)
  }

}
