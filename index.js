const fs = require('fs')
const path = require('path')
const walkdir = require('walkdir')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const titlecase = require('titlecase').toLaxTitleCase
const merge = require('lodash').merge
// const uniq = require('lodash').uniq
// const pluck = require('lodash').pluck
const patterns = {
  extensions: /\.(md|markdown|html)$/i,
  nested: /\/\w+\//
}
module.exports = function chip (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var content = {
    sections: {},
    pages: {}
  }

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

    // href is same as filename, without extension
    page.href = page.filename
      .replace(patterns.extensions, '')
      .replace(/\/index$/, '')


    // Look for title in HTML if not specified in frontmatter
    if (!page.title) {
      page.title = $dom('title').text()
    }

    // Derive title from filename as a last resort
    if (!page.title) {
      page.title = titlecase(path.basename(page.href).replace(/-/g, ' '))
    }

    // Infer section from page's parent directory
    if (page.filename.match(patterns.nested)) {
      page.section = page.filename.split('/')[1]

      // Create section
      if (!content.sections[page.section]) {
        content.sections[page.section] = {
          title: titlecase(page.section),
          pages: {}
        }
      }

      // Add page to section
      content.sections[page.section].pages[page.href] = page

      // Is this an index page?
      if (page.href === '/'+page.section){
        page.isIndex = true
      }
    }

    // Add page to pages
    content.pages[page.href] = page
  })

  emitter.on('end', function () {
    cb(null, content)
  })

}
