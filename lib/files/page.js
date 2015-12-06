'use strict'

const path            = require('path')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const frontmatter     = require('html-frontmatter')
const titlecase       = require('titlecase').toLaxTitleCase
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class Page extends File {
  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)

    this.getFrontmatter()
    this.parseContent()
    this.isDone = true
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.content.original))
  }

  parseContent() {
    var self = this

    // Markdown or HTML?
    // Either way, $ becomes a jquery-esque cheerio DOM object
    if (this.isMarkdown) {
      var $ = marky(this.content.original, {
        sanitize: false, // allow script tags and stuff
        prefixHeadingIds: false
      })
    } else {
      var $ = cheerio.load(this.content.original)
    }

    // Set root path on `src` attributes in the DOM
    $('[src]').each(function(){
      var src = $(this).attr('src')
      if (src.match(patterns.protocolRelativeUrl) || src.match(patterns.absoluteUrl)) return
      $(this).attr('src', path.join(self.path.dir, src))
    })

    // Set root path on `href` attributes in the DOM
    $('[href]').each(function(){
      var href = $(this).attr('href')
      if (href.match(patterns.protocolRelativeUrl) || href.match(patterns.absoluteUrl)) return
      $(this).attr('href', path.join(self.path.dir, href))
    })

    // Stingify the cleaned up DOM tree
    this.content.processed = $.html()

    // Derive page title
    // Precedence: HTML frontmatter, <title> tag, filename
    this.title = this.title || $('title').text() || titlecase(this.path.name)
  }

  get isMarkdown() {
    return !!this.path.ext.match(patterns.markdown)
  }

}
