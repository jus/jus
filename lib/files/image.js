'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
const getImageColors  = require('get-image-colors')
const exif            = require('exif-parser')
const imageSize       = require('image-size')

module.exports = {
  filetypeSteps () {
    // Define the contextualize DO step (and UNDO step)
    this.recipe.push({
      ctxDO (ctx) {

        // Attach this image to all pages in the same directory
        ctx.pages.forEach(page => {
          if (page.path.dir === this.path.dir) {
            // It is the first of its type in the page (so needs initialization)
            if (!page[this.typePlural]) page[this.typePlural] = {}
            page[this.typePlural][this.path.name] = this
          }
        })

      },

      ctxUNDO (ctx) {

        // Remove this image from all pages in the same directory
        ctx.pages.forEach(page => {
          if (page.path.dir === this.path.dir && page[this.typePlural]) {
            delete page[this.typePlural][this.path.name]
          }
        })

      }

    })
  },

  read () {
    // No-op. `Image` class does not read files directly.
    // This function placeholder needs to be here to override `File` class read ()
  },

  // Overrides `File` class default `parseCallback` method. No output needed
  parseCallback (err) {
    if (err) throw err
  },

  setDimensions () {
    this.dimensions = imageSize(this.path.processRelative)
  },

  setExif () {
    if (!this.isJPEG()) return
    this.exif = exif.create(fs.readFileSync(this.path.processRelative)).parse()
  },

  setColors () {
    var self = this
    getImageColors(this.path.processRelative, function(err, colors){
      if (err) throw err
      self.colors = colors.map(color => color.hex())

      self.squeezed = true
    })
  },

  isJPEG () {
    var ext = this.path.ext.toLowerCase()
    return ext === '.jpg' || ext === '.jpeg'
  }

}
