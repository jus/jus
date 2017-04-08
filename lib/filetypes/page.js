'use strict'

const frontmatter     = require('html-frontmatter')
const titlecase       = require('inflection').titleize
const path            = require('upath')
const File            = require('../file')

module.exports = class Page extends File {

  constructor(filepath, sourceDir, targetDir, plugin) {
    super(filepath, sourceDir, targetDir, plugin)
  }

  // Override `setHref()` in `File` class because index is a special routing case
  setHref() {
    var tail = this.isIndex ? this.path.dir : path.join(this.path.dir, this.path.name)
    this.href = path.join(process.env.JUS_BASEDIR, tail)
  }

  // Overrides `File` class default `parseCallback` method. No output needed
  parseCallback (err) {
    if (err) throw err
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.input))
  }

  // Precedence: HTML frontmatter, <title> tag, filename
  //TODO: Consider changing feature from "test required" to "plugin optional"
  setTitle() {
    this.title = this.title
      || this.$('title').text()
      || titlecase(this.path.name)
  }

  // Return an array of ancestor layouts
  extractLayouts (layouts, current) {
    var result = []

    while (current) {
      result.push(current)
      current = layouts[current.layout]
    }

    return result
  }

  distinctContextualize (ctx) {
    // Attach all images in the same directory to this page
    ctx.images.forEach(image => {
      if (image.path.dir === this.path.dir) {
        if (!this.images) this.images = {} // It is the first image in the page
        this.images[image.path.name] = image
      }
    })

    // Attach data from all datafiles in the same directory to this page
    ctx.datafiles.forEach(datafile => {
      if (datafile.path.dir === this.path.dir) {
        if (!this.data) this.data = {} // It is the first image in the page
        this.data[datafile.path.name] = datafile.data
      }
    })
  }

  distinctDecontextualize (ctx) {
    // Remove data from all datafiles in the same directory from this page
    ctx.datafiles.forEach(datafile => {
      if (datafile.path.dir === this.path.dir && this.data) {
        delete this.data[datafile.path.name]
      }
    })

    // Remove all image in the same directory from this page
    ctx.images.forEach(image => {
      if (image.path.dir === this.path.dir && this[t]) {
        delete this[t][image.path.name]
      }
    })
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
