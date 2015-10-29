const fs = require('fs')
const path = require('path')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const merge = require('lodash').merge
const titlecase = require('titlecase').toLaxTitleCase

const patterns = require('./patterns')

module.exports = function parsePage(filepath, baseDir) {

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
    .replace(patterns.page, '')
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
  }

  // Look for images in the page's directory
  if (page.isIndex) {
    var images = fs.readdirSync(path.dirname(page.fullPath))
      .filter(function (file) {
        return !!file.match(patterns.image)
      })

    if (images.length) {
      page.images = {}
      images.forEach(function (image) {
        var key = path.basename(image).replace(patterns.image, '')
        var value = {
          href: page.href + "/" + path.basename(image)
        }
        page.images[key] = value
      })
    }
  }

  return page
}
