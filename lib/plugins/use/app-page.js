'use strict'

const path            = require('upath')
const markdown        = require('markdown-it')
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
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    let isFound = allowedExtensions.indexOf(extension) > -1
    return callback(null, isFound ? '.html' : false)
  },

  parse (file, callback) {

    function getDOMObject (f) {
      if (isMarkdown(f)) {
        // Define markdown options
        const md = markdown({
          html: true,                 // allow script tags and stuff
          linkify: true,              // turn orphan URLs into hyperlinks

          // highlight option copied from `markdown-it` documentation
          // https://markdown-it.github.io/markdown-it/
          highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return '<pre class="hljs"><code>' +
                       hljs.highlight(lang, str, true).value +
                       '</code></pre>';
              } catch (__) {}
            }

            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
          }

        })

        md.use(require('markdown-it-named-headers'))

        f.$ = cheerio.load(md.render(f.input))
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

  render (context, callback) {
    const file = this

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
    try {
      output = handlebars.compile(output)(ctx)
    } catch (e) {
      return callback(`...trying to process handlebars in file: ${file.href}
        ${e}`, file.input)
    }

    // Back to DOM again
    $ = cheerio.load(output)

    // Add title tag to head, if missing
    if (!$('title').length && $('head').length) {
      $('head').prepend(`<title>${file.title}</title>`)
    }

    return callback(null, $.html())
  }

}
