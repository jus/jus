'use strict'

const path            = require('upath')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const handlebars      = require('handlebars')
const lobars          = require('lobars')

handlebars.registerHelper(lobars)

module.exports = {
  // ********
  // plugin
  // ********
  // Every attribute is optional except `check:`
  // ... all other attributs have failover defaults

  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 10,

  filetype: 'page',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  toExt: (oldExt) => {
    return '.html' // force target extension
  },

  render: (context, callback) => {
    var file = context.file
    var $ = file.$
    var ctx = Object.assign({page: file}, context)
    var layouts = context.layouts
    var layout
    var output

    if (file.layout) {
      // Use layout specified in frontmatter
      layout = layouts[file.layout]
    } else if (layouts.default && file.layout !== false) {
      // Use default layout if it exists, (unless set to `false` in frontmatter)
      layout = layouts.default
    }

    // Convert DOM to HTML so it can be handlebarred
    output = $.html()

    // Wrap layout(s) around page
    if (layout) {
      file.extractLayouts(layouts, layout).forEach(layout => {
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
      $('head').prepend(`<title>${file.title}</title>`)
    }

    return callback(null, $.html())
  }

/*
  transform: (file, callback) => {
    return callback(null, result)
  },

  mine: (file, callback) => {
    return callback(null, result)
  },

  branch: (file, callback) => {
    return callback(null, result)
  },

  translate: (file, callback) => {
    return callback(null, result)
  }
*/
}
