'use strict'

const path            = require('upath')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const handlebars      = require('handlebars')
const lobars          = require('lobars')

handlebars.registerHelper(lobars)

module.exports = {

   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",

  // Check precedence: higher first to lower last
  priority: 10,

  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'page',

  // calls back with a boolean indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },

  toExtension: (oldExt) => {
    // Simple rule, force to '.html'
    return '.html'
  },

  parse: (file, callback) => {

    function getDOMObject (f) {
      if (isMarkdown(f)) {
        f.$ = marky(f.input, {
          sanitize: false,            // allow script tags and stuff
          linkify: true,              // turn orphan URLs into hyperlinks
          highlightSyntax: true,      // run highlights on fenced code blocks
          prefixHeadingIds: false,    // prevent DOM id collisions
        })
      } else {
       f.$ = cheerio.load(f.input)
      }
    }

    function isMarkdown(f) {
      var ext = f.path.ext.toLowerCase()
      return ext === '.md' || ext === '.markdown' || ext === '.mdown'
    }

    file.getFrontmatter()
    getDOMObject(file)
    file.setTitle()

    return callback(null)
  },

  render: (file, context, callback) => {
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

}
