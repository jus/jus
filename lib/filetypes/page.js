'use strict'

const frontmatter     = require('html-frontmatter')
const cheerio         = require('cheerio')
const handlebars      = require('handlebars')
const marky           = require('marky-markdown')
const titlecase       = require('inflection').titleize
const path            = require('upath')
const pluralize       = require('inflection').pluralize
const File            = require('../file')

module.exports = class Page extends File {

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
    this.getFrontmatter()
    this.getDOMObject()
    //    this.transform() // To apply "transforms/filters"
    //    this.mine() // To apply "mine/extract" data
    //    this.branch() // To spun other file (like minified or censored version)
    this.setTitle()
    this.squeezed = true
  }

  render (context, callback) {
    context.file = this
    return this.functions.render(context, callback)
  }

  // Override `setHref()` in `File` class because index is a special routing case
  setHref() {
    var tail = this.isIndex ? this.path.dir : path.join(this.path.dir, this.path.name)
    this.href = path.join(process.env.JUS_BASEDIR, tail)
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.input))
  }

  getDOMObject() {
    if (this.isMarkdown) {
      this.$ = marky(this.input, {
        sanitize: false,            // allow script tags and stuff
        linkify: true,              // turn orphan URLs into hyperlinks
        highlightSyntax: true,      // run highlights on fenced code blocks
        prefixHeadingIds: false,    // prevent DOM id collisions
      })
    } else {
     this.$ = cheerio.load(this.input)
    }
  }

  // Precedence: HTML frontmatter, <title> tag, filename
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

  get isMarkdown() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.md' || ext === '.markdown' || ext === '.mdown'
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
