const fs = require('fs')
const path = require('path')
const marky = require('marky-markdown')
const cheerio = require('cheerio')
const frontmatter = require('html-frontmatter')
const merge = require('lodash').merge
const titlecase = require('titlecase').toLaxTitleCase

const patterns = require('../patterns')

module.exports = function parsePage(filepath, baseDir, cache) {

  var page = {
    href: null,
    title: null,
    fullPath: filepath,
    filename: path.basename(filepath),
    extension: path.extname(filepath),
    relativePath: filepath.replace(baseDir, ''),
    parent: path.dirname(filepath.replace(baseDir, '')),
    stats: fs.statSync(filepath),
    content: {
      original: fs.readFileSync(filepath, 'utf8'),
      processed: null
    }
  }

  // Clean URLs
  // /foo/bar.html       => /foo/bar
  // /wibble/index.md    => /wibble
  page.href = page.relativePath
    .replace(patterns.page, '')
    .replace(patterns.index, '')

  if (!page.href) page.href = '/'

  if (cache && cache.pages && cache.pages[page.href]) {
    var cached = cache.pages[page.href]
    // Dates that have been JSON stringified are weird. Use JSON.stringify to compare
    if (JSON.stringify(cached.stats.mtime) === JSON.stringify(page.stats.mtime)) {
      return cached
    }
  }

  // Look for HTML frontmatter
  merge(page, frontmatter(page.content.original))

  // If markdown, parse with marky-markdown
  // If HTML, parse with cheerio.
  // In either case, $ becomes a jquery-esque cheerio DOM object
  if (page.extension.match(patterns.markdown)) {
    var $ = marky(page.content.original, {
      sanitize: false, // allow script tags and stuff
      prefixHeadingIds: false
    })
  } else {
    var $ = cheerio.load(page.content.original)
  }

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

  // Stingify the cleaned up DOM tree
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

  // Set parent and grandparent
  if (page.parent == '/') {
    delete page.parent
  } else {
    page.parentName = path.basename(page.parent)
    page.grandparent = path.dirname(page.parent)

    if (page.granparent == '/') {
      delete page.grandparent
    } else {
      page.grandparentName = path.basename(page.grandparent)
    }
  }

  return page
}
