'use strict'

const path            = require('upath')
const marky           = require('marky-markdown-lite')
const cheerio         = require('cheerio')
const handlebars      = require('handlebars')
const lobars          = require('lobars')

handlebars.registerHelper(lobars)

module.exports = {

  // Not used, is just like a comment
  // name: "what-ever-text works",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'page',

  // calls back with a result indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    let isFound = allowedExtensions.indexOf(extension) > -1

    // Leave a check "hole" to not block standard plugin that handles layouts
    let isLayout = !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)

    return callback(null, isFound && !isLayout ? '.html' : false)
  },

  parse: (file, callback) => {

    // TODO: Remove
    console.log(`Using plugin in ${__filename.replace(__dirname,'')} for file ${file.href}`)

    function getDOMObject (f) {

      var buffer = f.input

      if (isMarkdown(f)) {

        // encode quotes in handlebars statements
        var mustaches = buffer.match(/{([^{}]*)}/g)

        if (mustaches) {
          mustaches.forEach(block => {
            buffer = buffer.replace(block, block.replace(/"/g, '&quot;').replace(/'/g, "&apos;"))
          })
        }

        f.$ = marky(buffer)
      } else {
       f.$ = cheerio.load(buffer)
      }
    }

    function isMarkdown(f) {
      var ext = f.path.ext.toLowerCase()
      return ext === '.md' || ext === '.markdown' || ext === '.mdown'
    }

    file.getFrontmatter()
    getDOMObject(file)
    file.setTitle()

    return callback(null, true)
  },

  render: (context, callback) => {
    const file = context.file

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
