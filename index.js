// const path = require('path')
const fs = require('fs')
const walkdir = require('walkdir')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const merge = require('lodash').merge
const patterns = {
  extensions: /\.(md|markdown|html)$/i,
  nested: /\//
}
module.exports = function chip (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var pages = {}

  emitter.on('file', function (filepath, stat) {
    if (filepath.match(/readme\.md/i)) return
    if (filepath.match(/node_modules/)) return
    if (!filepath.match(patterns.extensions)) return

    var page = {
      title: null,
      heading: null,
      section: null,
      href: null,
      filename: filepath.replace(baseDir, ''),
      modified: fs.statSync(filepath).mtime,
      content: fs.readFileSync(filepath, 'utf8')
    }

    // Look for HTML frontmatter
    merge(page, frontmatter(page.content))

    // Convert markdown to HTML
    var $dom = marky(page.content, {
      sanitize: false, // allow script tags and stuff
      prefixHeadingIds: false // don't apply safe prefixes to h1/h2... DOM ids
    })

    page.content = $dom.html()

    // Infer section from top directory
    if (page.filename.match(patterns.nested)) {
      page.section = page.filename.split('/')[1]
    }

    page.href = page.filename
      .replace(patterns.extensions, '')
      .replace(/\/index$/, '')

    // Look for title in HTML if not specified in frontmatter
    if (!page.title) {
      page.title = $dom('title').text()
    }

    pages[page.href] = page
  })

  emitter.on('end', function () {
    cb(null, pages)
  })

}
