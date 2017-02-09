'use strict'

const fs              = require('fs')
const path            = require('upath')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
// const frontmatter     = require('html-frontmatter')
const handlebars      = require('handlebars')
const lobars          = require('lobars')
const hrefType        = require('href-type')
const titlecase       = require('inflection').titleize
const startsWith      = require('lodash').startsWith
const File            = require('../file')

handlebars.registerHelper(lobars)

module.exports = class Page extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
//    this.getFrontmatter()
    this.getDOMObject()
    this.setBasedir()
    this.setTitle()
    this.squeezed = true
  }

  setHref() {
    var tail = this.isIndex ? this.path.dir : path.join(this.path.dir, this.path.name)
    this.href = path.join(process.env.JUS_BASEDIR, tail)
  }

//  getFrontmatter() {
//    Object.assign(this, frontmatter(this.input))
//  }

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

  setBasedir() {
    var self = this
    var $ = this.$

    // Set root path on `src` attributes in the DOM
    $('[src]').each(function() {
      var src = $(this).attr('src')
      if (hrefType(src) != 'relative') return
      if (startsWith(src, '/'+process.env.JUS_BASEDIR)) return
      // $(this).attr('src', path.join(process.env.JUS_BASEDIR, src).replace(/^\//, ''))
    })

    // Set root path on `href` attributes in the DOM
    $('[href]').each(function() {
      var href = $(this).attr('href')
      if (hrefType(href) != 'relative') return
      if (startsWith(href, '/'+process.env.JUS_BASEDIR)) return
      // $(this).attr('href', path.join(process.env.JUS_BASEDIR, href).replace(/^\//, ''))
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

    // decode quotes in handlebars statements
    var mustaches = output.match(/{([^{}]*)}/g)

    if (mustaches) {
      mustaches.forEach(block => {
        output = output.replace(block, block.replace(/&quot;/g, '"').replace(/&apos;/g, "'"))
      })
    }

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

  get isIndex() {
    return this.path.name === 'index'
  }

}
