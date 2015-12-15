'use strict'

const fs              = require('fs')
const path            = require('path')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const frontmatter     = require('html-frontmatter')
const handlebars      = require('handlebars')
const titlecase       = require('titlecase').toLaxTitleCase
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Page extends File {
  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
  }

  squeeze() {
    this.readInputFile()
    this.getFrontmatter()
    this.squeezed = true
  }

  finish(context) {
    if (this.isCached) return
    this.parseMarkdown()
    this.updateRelativePaths()
    this.injectData(context)
    this.setTitle()
    this.toHTML()
  }

  getHref() {
    if (this.isIndex) return this.path.dir
    return path.join(this.path.dir, this.path.name)
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.output))
  }

  parseMarkdown() {
    if (this.isMarkdown) {
      this.$ = marky(this.output, {
        sanitize: false, // allow script tags and stuff
        prefixHeadingIds: false
      })
    } else {
     this.$ = cheerio.load(this.output)
    }
  }

  updateRelativePaths() {
    var self = this
    var $ = this.$

    // Set root path on `src` attributes in the DOM
    $('[src]').each(function(){
      var src = $(this).attr('src')
      if (src.match(/^\//) || src.match(patterns.absoluteUrl)) return
      $(this).attr('src', path.join(self.path.dir, src))
    })

    // Set root path on `href` attributes in the DOM
    $('[href]').each(function(){
      var href = $(this).attr('href')
      if (href.match(/^\//) || href.match(patterns.absoluteUrl)) return
      $(this).attr('href', path.join(self.path.dir, href))
    })
  }

  injectData(context) {
    var ctx = Object.assign({page: this}, context)
    var layouts = context.layouts
    var layout

    if (this.layout) {
      // Use layout specified in frontmatter
      layout = layouts[this.layout]
    } else if (layouts.default && this.layout !== false) {
      // Use default layout if it exists, (unless set to `false` in frontmatter)
      layout = layouts.default
    }

    // From DOM to HTML
    this.output = this.$.html()

    // Wrap layout around page
    if (layout) {
      this.output = layout.output.replace('{{{body}}}', this.output)
    }

    this.output = handlebars.compile(this.output)(ctx)

    // And back to DOM again
    this.$ = cheerio.load(this.output)
  }

  // Precedence: HTML frontmatter, <title> tag, filename
  setTitle() {
    var $ = this.$

    this.title = this.title || $('title').text() || titlecase(this.path.name)

    // Add title tag to head, if missing
    if (!$('title').length && $('head').length) {
      $('head').prepend(`<title>${this.title}</title>`)
    }
  }

  toHTML() {
    this.output = this.$.html()
  }

  get isMarkdown() {
    return !!this.path.ext.match(patterns.markdown)
  }
}
