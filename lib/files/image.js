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
    this.setDimensions()
    this.setExif()
    this.setColors()
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
    return !!this.path.ext.match(patterns.jpg)
  }

}
