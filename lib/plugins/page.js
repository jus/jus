'use strict'

const fs              = require('fs')
const path            = require('upath')
const marky           = require('marky-markdown')
const cheerio         = require('cheerio')
const frontmatter     = require('html-frontmatter')
const handlebars      = require('handlebars')
const lobars          = require('lobars')
const titlecase       = require('inflection').titleize
const File            = require('../file')

handlebars.registerHelper(lobars)

module.exports = class Page extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir)
    this.setTargetPathsAndHref(sourceDir, targetDir, '.html') // force target extension
    // Overwrite `file.href` because "index" is a special routing case
    this.setIndexHref()
    this.isRenderable = true // means, will be render before written in targetDir
  }

  // calls back with a boolean indicating whether this class should process the given file.
  static check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    return callback(null, allowedExtensions.indexOf(extension) > -1)
  }

  setIndexHref() {
    var tail = this.isIndex ? this.path.dir : path.join(this.path.dir, this.path.name)
    this.href = path.join(process.env.JUS_BASEDIR, tail)
  }

  squeeze() {
    this.squeezed = false
    this.read()
    this.getFrontmatter()
    this.getDOMObject()
    this.setTitle()
    this.squeezed = true
  }

  distinctContextualize (ctx) {
    // Attach all images in the same directory to this page
    ctx.images.forEach(image => {
      if (image.path.dir === this.path.dir) {
        if (!this.images) this.images = {} // It is the first image in the page
        this.images[image.path.name] = image
      }
    })

    // Attach data from all datafiles in the same directory to this page
    ctx.datafiles.forEach(datafile => {
      if (datafile.path.dir === this.path.dir) {
        if (!this.data) this.data = {} // It is the first image in the page
        this.data[datafile.path.name] = datafile.data
      }
    })
  }

  distinctDecontextualize (ctx) {
    // Remove data from all datafiles in the same directory from this page
    ctx.datafiles.forEach(datafile => {
      if (datafile.path.dir === this.path.dir && this.data) {
        delete this.data[datafile.path.name]
      }
    })

    // Remove all image in the same directory from this page
    ctx.images.forEach(image => {
      if (image.path.dir === this.path.dir && this[t]) {
        delete this[t][image.path.name]
      }
    })
  }

  getFrontmatter() {
    Object.assign(this, frontmatter(this.input))
  }

  getDOMObject() {
    if (this.isMarkdown) {
      this.$ = marky(this.input, {
        sanitize: false,            // allow script tags and stuff
        linkify: true,              // turn orphan URLs into hyperlinks
        highlightSyntax: true,      // run highlights on fenced code blocks
        prefixHeadingIds: false,    // prevent DOM id collisions
      })
    } else {
     this.$ = cheerio.load(this.input)
    }
  }

  // Precedence: HTML frontmatter, <title> tag, filename
  setTitle() {
    this.title = this.title
      || this.$('title').text()
      || titlecase(this.path.name)
  }

  // Return an array of ancestor layouts
  extractLayouts (layouts, current) {
    var result = []

    while (current) {
      result.push(current)
      current = layouts[current.layout]
    }

    return result
  }

  render(context, done) {
    var $ = this.$
    var ctx = Object.assign({page: this}, context)
    var layouts = context.layouts
    var layout
    var output

    if (this.layout) {
      // Use layout specified in frontmatter
      layout = layouts[this.layout]
    } else if (layouts.default && this.layout !== false) {
      // Use default layout if it exists, (unless set to `false` in frontmatter)
      layout = layouts.default
    }

    // Convert DOM to HTML so it can be handlebarred
    output = $.html()

    // Wrap layout(s) around page
    if (layout) {
      this.extractLayouts(layouts, layout).forEach(layout => {
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
      $('head').prepend(`<title>${this.title}</title>`)
    }

    return done(null, $.html())
  }

  get isMarkdown() {
    var ext = this.path.ext.toLowerCase()
    return ext === '.md' || ext === '.markdown' || ext === '.mdown'
  }

  get isIndex() {
    return this.path.name === 'index'
  }

}
