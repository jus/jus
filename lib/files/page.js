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
  constructor(filepath, baseDir) {
    super(filepath, baseDir)
  }

  squeeze() {
    this.squeezed = false
    this.readInputFile()
    this.getFrontmatter()
    this.getDOM()
    // this.updateRelativePaths()
    this.getTitle()
    this.squeezed = true
  }

  getHref() {
    if (this.isIndex) return this.path.dir
    return path.join(this.path.dir, this.path.name)
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.output))
  }

  getDOM() {
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
    $('[src]').each(function() {
      var src = $(this).attr('src')
      if (src.match(/^\//) || src.match(patterns.absoluteUrl)) return
      $(this).attr('src', path.join(self.path.dir, src))
    })

    // Set root path on `href` attributes in the DOM
    $('[href]').each(function() {
      var href = $(this).attr('href')
      console.log('href', href)
      if (href.match(/^\//) || href.match(patterns.absoluteUrl)) return
      $(this).attr('href', path.join(self.path.dir, href))
    })
  }

  // Precedence: HTML frontmatter, <title> tag, filename
  getTitle() {
    this.title = this.title
      || this.$('title').text()
      || titlecase(this.path.name)
  }

  render(context) {
    var $ = this.$
    var ctx = Object.assign({page: this}, context)
    var layouts = context.layouts
    var layout
    var output

    if (this.layout) {
      // Use layout specified in frontmatter
      layout = layouts[this.layout]
    } else if (layouts.default && this.layout !== false) {
      // Use default layout if it exists, (unless set to `false` in frontmatter)
      layout = layouts.default
    }

    // Convert DOM to HTML so it can be handlebarred
    output = $.html()

    // Wrap layout around page
    if (layout) output = layout.wrap(output)

    // Render page with Handlebars
    output = handlebars.compile(output)(ctx)

    // Back to DOM again
    $ = cheerio.load(output)

    // Add title tag to head, if missing
    if (!$('title').length && $('head').length) {
      $('head').prepend(`<title>${this.title}</title>`)
    }

    return $.html()
  }

  get isMarkdown() {
    return !!this.path.ext.match(patterns.markdown)
  }
}
