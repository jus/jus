const fs = require('fs')
const path = require('path')
const marky = require('marky-markdown')
const frontmatter = require('html-frontmatter')
const merge = require('lodash').merge
const titlecase = require('titlecase').toLaxTitleCase

const patterns = require('../patterns')

module.exports = function parsePage(filepath, baseDir, cache) {

  var page = {
    title: null,
    heading: null,
    section: null,
    href: null,
    fullPath: filepath,
    extension: path.extname(filepath),
    filename: path.basename(filepath),
    relativePath: filepath.replace(baseDir, ''),
    parent: path.dirname(filepath.replace(baseDir, '')),
    stats: fs.statSync(filepath),
    content: {
      original: fs.readFileSync(filepath, 'utf8'),
      processed: null
    }
  }

  // href is same as relative path, without extension
  page.href = page.relativePath
    .replace(patterns.page, '')
    .replace(patterns.index, '')

  // Look for a cached page
  if (cache && cache.pages && cache.pages[page.href]) {
    var cached = cache.pages[page.href]
    // Dates that have been JSON stringified are weird. Use JSON.stringify to compare
    if (JSON.stringify(cached.stats.mtime) === JSON.stringify(page.stats.mtime)) {
      return cached
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
    $(this).attr('src', path.join(page.parent, src))
  })

  // Set root path on `href` attributes in the DOM
  $('[href]').each(function(){
    var href = $(this).attr('href')
    if (href.match(patterns.protocolRelativeUrl) || href.match(patterns.absoluteUrl)) return
    $(this).attr('href', path.join(page.parent, href))
  })

  page.content.processed = $.html()

  // Is this an index page?
  page.isIndex = !!path.basename(page.relativePath).match(/^index\./i)

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
