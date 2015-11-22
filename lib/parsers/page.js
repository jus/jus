const fs = require('fs')
const path = require('path')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const merge = require('lodash').merge
const titlecase = require('titlecase').toLaxTitleCase

const patterns = require('../patterns')

module.exports = function parsePage(filepath, baseDir) {

  var page = {
    title: null,
    heading: null,
    section: null,
    href: null,
    modified: fs.statSync(filepath).mtime,
    fullPath: filepath,
    relativePath: filepath.replace(baseDir, ''),
    relativeDirName: path.dirname(filepath.replace(baseDir, '')),
    content: {
      original: fs.readFileSync(filepath, 'utf8'),
      processed: null
    }
  }

  // Look for HTML frontmatter
  merge(page, frontmatter(page.content.original))

  // Convert markdown to a jquery-esque cheerio DOM object
  var $ = marky(page.content.original, {
    sanitize: false, // allow script tags and stuff
    prefixHeadingIds: false
  })

  // Set root path on `src` attributes in the DOM
  $('[src]').each(function(){
    var src = $(this).attr('src')
    if (src.match(patterns.protocolRelativeUrl) || src.match(patterns.absoluteUrl)) return
    $(this).attr('src', path.join(page.relativeDirName, src))
  })

  // Set root path on `href` attributes in the DOM
  $('[href]').each(function(){
    var href = $(this).attr('href')
    if (href.match(patterns.protocolRelativeUrl) || href.match(patterns.absoluteUrl)) return
    $(this).attr('href', path.join(page.relativeDirName, href))
  })

  page.content.processed = $.html()

  // Is this an index page?
  page.isIndex = !!path.basename(page.relativePath).match(/^index\./i)

  // href is same as relative path, without extension
  page.href = page.relativePath
    .replace(patterns.page, '')
    .replace(/\/index$/, '')

  // Look for title in HTML if not specified in frontmatter
  if (!page.title) {
    page.title = $('title').text()
  }

  // Derive title from filename as a last resort
  if (!page.title) {
    page.title = titlecase(path.basename(page.href).replace(/-/g, ' '))
  }

  // Infer section from page's parent directory
  if (page.href.match(patterns.nested)) {
    page.section = page.href.split('/')[1]
  }

  return page
}
