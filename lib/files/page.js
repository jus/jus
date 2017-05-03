'use strict'

const fs              = require('fs')
const path            = require('upath')
const markdown        = require('markdown-it')
const hljs            = require('highlight.js')
const cheerio         = require('cheerio')
const frontmatter     = require('html-frontmatter')
const handlebars      = require('handlebars')
const lobars          = require('lobars')
const titlecase       = require('inflection').titleize
const File            = require('../file')

handlebars.registerHelper(lobars)

module.exports = class Page extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.getFrontmatter()
    this.getDOMObject()
    this.setTitle()
    this.squeezed = true
  }

  setHref() {
    var tail = this.isIndex ? this.path.dir : path.join(this.path.dir, this.path.name)
    this.href = path.join(process.env.JUS_BASEDIR, tail)
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.input))
  }

  getDOMObject() {
    if (this.isMarkdown) {
      // Define markdown options
      const marky = markdown({
        html: true,                 // allow script tags and stuff
        linkify: true,              // turn orphan URLs into hyperlinks

        // highlight option copied from `markdown-it` documentation
        // https://markdown-it.github.io/markdown-it/
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (__) {}
          }

          return ''; // use external default escaping
        }

      })

      this.$ = cheerio.load(marky.render(this.input))
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

    // Wrap layout(s) around page
    if (layout) {
      this.extractLayouts(layouts, layout).forEach(layout => {
        output = layout.wrap(output)
      })
    }

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
