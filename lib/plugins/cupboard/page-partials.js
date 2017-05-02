'use strict'

const path            = require('upath')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const handlebars      = require('handlebars')
const lobars          = require('lobars')

handlebars.registerHelper(lobars)

module.exports = {

  // Not used, is just like a comment
  name: "partials out of layouts v0.1",

  // Check precedence: higher first to lower last
  priority: 10,

  filetype: 'page',

  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    let isFound = allowedExtensions.indexOf(extension) > -1

    // Leave a check "hole" to not block standard plugin that handles layouts
    let isLayout = !!filename.match(/\/layout.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)

    return callback(null, isFound && !isLayout ? '.html' : false)
  },

  parse (file, callback) {
    // TODO: Remove
    console.log(`Using plugin in ${__filename.replace(__dirname,'')} for file ${file.href}`)

    function getDOMObject (f) {
      f.$ = marky(f.input, {
        sanitize: false,            // allow script tags and stuff
        linkify: true,              // turn orphan URLs into hyperlinks
        highlightSyntax: true,      // run highlights on fenced code blocks
        prefixHeadingIds: false,    // prevent DOM id collisions
      })
    }

    function isMarkdown(f) {
      var ext = f.path.ext.toLowerCase()
      return ext === '.md' || ext === '.markdown' || ext === '.mdown'
    }

    file.getFrontmatter()

    // TODO: Remove `getDOMObject(file)` and `file.setTitle()` They are here ...
    // ... only to not change the orignal tests. But their results are ...
    // ... overwriten in `render()`
    getDOMObject(file)  // Just here for test. Read TODO
    file.setTitle() // Just here for test. Read TODO

    return callback(null)
  },

  render (context, callback) {
    const file = this

    var ctx = Object.assign({page: file}, context)
    var layouts = context.layouts
    var layout
    var output

    function getDOMObject (f) {
      return f.$ = marky(f.input, {
        sanitize: false,            // allow script tags and stuff
        linkify: true,              // turn orphan URLs into hyperlinks
        highlightSyntax: true,      // run highlights on fenced code blocks
        prefixHeadingIds: false,    // prevent DOM id collisions
      })
    }

    function isMarkdown(f) {
      var ext = f.path.ext.toLowerCase()
      return ext === '.md' || ext === '.markdown' || ext === '.mdown'
    }

    if (file.layout) {
      // Use layout specified in frontmatter
      layout = layouts[file.layout]
    } else if (layouts.default && file.layout !== false) {
      // Use default layout if it exists, (unless set to `false` in frontmatter)
      layout = layouts.default
    }

    // Initialize output dependig on `isMarkdown` because markdown has been ...
    // ... processed already to not interfere with handlebars
    output = (isMarkdown(file)) ? getDOMObject (file).html() : file.input

    // Wrap layout(s) around page
    if (layout) {
      file.extractLayouts(layouts, layout).forEach(layout => {
        output = layout.input.replace('{{{body}}}', output)
      })
    }

    // decode quotes in handlebars statements
    var mustaches = output.match(/{([^{}]*)}/g)

    if (mustaches) {
      mustaches.forEach(block => {
        output = output.replace(block,
          block
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&gt;/g, ">") // handlebars symbol for partials
        )
      })
    }

    // Code added to "partials" feature
    let partialsToRegister = layouts.filter(layout => {
      // reject those that have the '{{{body}}}' string in it
      if (layout.input.indexOf('{{{body}}}') > -1) return false
      // select those not processed yet or those modified after processed
      return (!layout.partialParsedTime
        || layout.partialParsedTime < layout.stats.mtime)
    })

    // Register all partial in handlebars before calling handlebars.compile
    partialsToRegister.forEach(partial => {
      try {
        handlebars.registerPartial(partial.name, partial.input)
      } catch (e) {
        // Means, this is not a good parial, just ignore it
        console.log(`...oops! file = ${partial.href} Error: ${e}`)
      }
      // tag file as a seal, meaning: it does not need to be "re-processed" ...
      // ... if not modified
      partial.partialParsedTime = partial.stats.mtime
    })

    // Render page with Handlebars
    try {
      output = handlebars.compile(output)(ctx)
    } catch (e) {
      return callback(`...trying to process handlebars in file: ${file.href}
        error = ${e}`, file.input)
    }

    // Change to work in DOM
    var $ = file.$ = cheerio.load(output)

    //TODO: Consider changing setTitle() feature from "test required" to ...
    // ... "plugin optional"
    file.setTitle()

    // Add title tag to head, if missing
    if (!$('title').length && $('head').length) {
      $('head').prepend(`<title>${file.title}</title>`)
    }

    return callback(null, $.html())
  }

}
