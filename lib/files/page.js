'use strict'

const fs              = require('fs')
const path            = require('path')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const frontmatter     = require('html-frontmatter')
const handlebars      = require('handlebars')
const hrefType        = require('href-type')
const titlecase       = require('inflection').titleize
const File            = require('../file')

module.exports = class Page extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.getFrontmatter()
    this.getDOMObject()
    this.updateRelativePaths()
    this.setTitle()
    this.squeezed = true
  }

  setHref() {
    this.href = this.path.name === 'index'
      ? this.path.dir // /foo/index.html -> /foo
      : path.join(this.path.dir, this.path.name) // /bar.html -> /bar
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

  updateRelativePaths() {
    var self = this
    var $ = this.$

    // Set root path on `src` attributes in the DOM
    $('[src]').each(function() {
      var src = $(this).attr('src')
      if (hrefType(src) != 'relative') return
      $(this).attr('src', path.join(self.path.dir, src))
    })

    // Set root path on `href` attributes in the DOM
    $('[href]').each(function() {
      var href = $(this).attr('href')
      if (hrefType(href) != 'relative') return
      $(this).attr('href', path.join(self.path.dir, href).replace(/^\//, ''))
    })
  }

  // Precedence: HTML frontmatter, <title> tag, filename
  setTitle() {
    this.title = this.title
      || this.$('title').text()
      || titlecase(this.path.name)
  }

  render(context, done) {
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

    return done(null, $.html())
  }

  get isMarkdown() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.md' || ext === '.markdown' || ext === '.mdown'
  }

}
