const fs = require('fs')
const path = require('path')
const walkdir = require('walkdir')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const titlecase = require('titlecase').toLaxTitleCase
const merge = require('lodash').merge

const patterns = {
  markupExtensions: /\.(md|markdown|html)$/i,
  imageFile: /\.(gif|jpg|png|svg)$/i,
  nested: /\/\w+\//
}

module.exports = function juicer (baseDir, cb) {
  var emitter = walkdir(baseDir)
  var result = {
    sections: {},
    pages: {}
  }

  emitter.on('file', function (filepath, stat) {
    if (filepath.match(/readme\.md/i)) return
    if (filepath.match(/node_modules/)) return
    if (!filepath.match(patterns.markupExtensions)) return

    var page = {
      title: null,
      heading: null,
      section: null,
      href: null,
      modified: fs.statSync(filepath).mtime,
      fullPath: filepath,
      relativePath: filepath.replace(baseDir, ''),
      content: {
        original: fs.readFileSync(filepath, 'utf8'),
        processed: null
      }
    }

    // Look for HTML frontmatter
    merge(page, frontmatter(page.content.original))

    // Convert markdown to HTML
    var $dom = marky(page.content.original, {
      sanitize: false, // allow script tags and stuff
      prefixHeadingIds: false
    })

    page.content.processed = $dom.html()

    // Is this an index page?
    page.isIndex = !!path.basename(page.relativePath).match(/^index\./i)

    // href is same as relative path, without extension
    page.href = page.relativePath
      .replace(patterns.markupExtensions, '')
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
    if (page.href.match(patterns.nested)) {
      page.section = page.href.split('/')[1]

      // Create section
      if (!result.sections[page.section]) {
        result.sections[page.section] = {
          title: titlecase(page.section),
          pages: {}
        }
      }

      // Add page to section
      result.sections[page.section].pages[page.href] = page
    }

    // Look for images in the page's directory
    if (page.isIndex) {
      var images = fs.readdirSync(path.dirname(page.fullPath))
        .filter(function (file) {
          return !!file.match(patterns.imageFile)
        })

      if (images.length) {
        page.images = {}
        images.forEach(function (image) {
          var key = path.basename(image).replace(patterns.imageFile, '')
          var value = {
            href: page.href + "/" + path.basename(image)
          }
          page.images[key] = value
        })
      }
    }

    // Add page to pages
    result.pages[page.href] = page
  })

  emitter.on('end', function () {
    cb(null, result)
  })

}
