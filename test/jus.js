/* globals describe, it */

const expect    = require('chai').expect
const cheerio   = require('cheerio')
const tmp       = require('tmp')
const jus       = require('..')
const they      = it

const sourceDir = __dirname + '/fixtures'
const targetDir = tmp.dirSync().name
var context

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    expect(jus).to.be.a('function')
  })

  it("emits a series of lifecycle events, ultimately emitting a squeezed context object", function (done) {
    var events = []
    jus(sourceDir, targetDir)
      .on('started', () => events.push('started'))
      .on('squeezing', () => events.push('squeezing'))
      .on('squeezed', (_context) => {
        expect(events).to.deep.equal(['started', 'squeezing'])
        context = _context
        done()
      })
  })

  describe('context', function() {

    it('is an object returned by the `squeezed` event', function () {
      expect(context).to.exist
      expect(context).to.be.an('object')
    })

    it('has an array for each primitive: files, images, layouts, pages, etc..', function(){
      expect(context.files).to.be.an('array')
      expect(context.images).to.be.an('array')
      expect(context.layouts).to.be.an('array')
      expect(context.pages).to.be.an('array')
      expect(context.scripts).to.be.an('array')
      expect(context.stylesheets).to.be.an('array')
    })
  })

  describe('files', function() {
    var files

    before(function(){
      files = context.files
    })

    they('are in an array', function () {
      expect(files).to.be.an('array')
    })

    describe('path', function() {
      it('is an object with a bunch of sliced and diced info about the filename', function(){
        var path = files['/apples.md'].path
        expect(path.full).to.include('/test/fixtures/apples.md')
        expect(path.relative).to.equal('/apples.md')
        expect(path.processRelative).to.equal('test/fixtures/apples.md')
        expect(path.root).to.equal('/')
        expect(path.dir).to.equal('/')
        expect(path.base).to.equal('apples.md')
        expect(path.ext).to.equal('.md')
        expect(path.name).to.equal('apples')

        expect(path.target.relative).to.equal('/apples.html')
        expect(path.target.full).to.equal(`${targetDir}/apples.html`)
        expect(path.target.ext).to.equal(`.html`)
      })

      it('includes target.relative', function () {
        expect(files['/apples.md'].path.target.relative).to.equal('/apples.html')
        expect(files['/styles.scss'].path.target.relative).to.equal('/styles.css')
        expect(files['/babel-and-browserify.js'].path.target.relative).to.equal('/babel-and-browserify.js')
      })

      it('includes target.full', function () {
        expect(files['/apples.md'].path.target.full).to.equal(`${targetDir}/apples.html`)
        expect(files['/styles.scss'].path.target.full).to.equal(`${targetDir}/styles.css`)
        expect(files['/babel-and-browserify.js'].path.target.full).to.equal(`${targetDir}/babel-and-browserify.js`)
      })

      it('includes target.ext', function () {
        expect(files['/apples.md'].path.target.ext).to.equal('.html')
        expect(files['/styles.scss'].path.target.ext).to.equal('.css')
        expect(files['/babel-and-browserify.js'].path.target.ext).to.equal('.js')
      })
    })
  })

  describe('pages', function () {
    var pages

    before(function(){
      pages = context.pages
    })

    they('have a "clean URL" href', function () {
      expect(pages['/apples.md'].href).to.equal('/apples')
    })

    they('have a "clean URL" href', function () {
      expect(pages['/thumbs/index.html'].href).to.equal('/thumbs')
    })

    they('include .md files', function () {
      expect(pages['/apples.md']).to.exist
    })

    they('include .markdown files', function () {
      expect(pages['/other/papayas.markdown']).to.exist
    })

    they('include .html files', function () {
      expect(pages['/oranges.html']).to.exist
    })

    they('are loaded regardless of case', function () {
      expect(pages['/other/UPPERCASE.HTML']).to.exist
    })

    they('ingest HTML frontmatter', function () {
      expect(pages['/apples.md'].title).to.equal('Apples!')
      expect(pages['/apples.md'].keywords).to.deep.equal(['fruit', 'doctors'])
    })

    they('preserve original content in `input`', function () {
      expect(pages['/other/papayas.markdown'].input).to.be.a('string')
    })

    they('convert markdown to HTML', function () {
      var $ = pages['/other/papayas.markdown'].$
      expect($('a[href="https://digestion.com"]').text()).to.equal('digestion')
    })

    they('have a cheerio DOM object ($)', function () {
      var $ = pages['/other/papayas.markdown'].$
      expect($).to.exist
      expect($.text).to.be.a('function')
      expect($.html).to.be.a('function')
    })

    they('get a titlecased version of their filename as a default title, if not set', function () {
      var page = pages['/other/papayas.markdown']
      var $ = page.$
      expect(page.title).to.equal('Papayas')

      // <title> tag is set after render
      var $ = cheerio.load(page.render(context))
      expect($('title').text()).to.equal('Papayas')
    })

    describe('`src` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other/index.md'].input
        output = pages['/other/index.md'].$.html()
      })

      it('converts relative', function(){
        expect(input).to.include('<img src="guava.png">')
        expect(output).to.include('<img src="/other/guava.png">')

        expect(input).to.include('<script src="banana.js">')
        expect(output).to.include('<script src="/other/banana.js">')
      })

      it('ignores relative with leading slash', function(){
        expect(input).to.include('<img src="/guava-leading-slashy.png">')
        expect(output).to.include('<img src="/guava-leading-slashy.png">')
      })

      it('ignores absolute', function(){
        expect(input).to.include('<img src="https://guava.com/logo.png">')
        expect(output).to.include('<img src="https://guava.com/logo.png">')
      })

      it('ignores protocol-relative', function(){
        expect(input).to.include('<img src="//guava-relative.com/logo.png">')
        expect(output).to.include('<img src="//guava-relative.com/logo.png">')
      })

    })

    describe('`href` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other/index.md'].input
        output = pages['/other/index.md'].$.html()
      })

      it('converts relative', function(){
        expect(input).to.include('<a href="papayas">papayas</a>')
        expect(output).to.include('<a href="other/papayas">papayas</a>')
      })

      it('ignores relative with leading slash', function(){
        expect(input).to.include('<a href="/grapes">grapes</a>')
        expect(output).to.include('<a href="/grapes">grapes</a>')
      })

      it('ignores absolute', function(){
        expect(input).to.include('<a href="http://mango.com">mango.com</a>')
        expect(output).to.include('<a href="http://mango.com">mango.com</a>')
      })

      it('ignores protocol-relative', function(){
        expect(input).to.include('<a href="//coconut-cdn.com">coconut-cdn.com</a>')
        expect(output).to.include('<a href="//coconut-cdn.com">coconut-cdn.com</a>')
      })

    })

    describe('title', function(){
      it('is derived from HTML frontmatter', function () {
        expect(pages['/apples.md'].title).to.equal('Apples!')
      })

      it('falls back to <title> tag, if present', function () {
        expect(pages['/oranges.html'].title).to.equal('We are Oranges')
      })

      it('falls back lastly to titlecased basename', function () {
        expect(pages['/other/papayas.markdown'].title).to.equal('Papayas')
      })

      it('injects <title> tag into HTML, if absent', function () {
        expect(pages['/oranges.html'].output).to.include('<title>We are Oranges</title>')
      })
    })
  })

  describe('images', function(){
    var pages

    before(function(){
      pages = context.pages
    })

    it("are attached to pages in the same directory", function () {
      expect(pages['/thumbs/png/index.md'].images.thumb).to.exist
    })

    they('can be SVGs', function () {
      expect(pages['/thumbs/svg/index.md'].images.thumbnail).to.exist
    })

    they('can be JPGs', function () {
      expect(pages['/thumbs/jpg/index.html'].images.thumb).to.exist
    })

    they('can be GIFs', function () {
      expect(pages['/thumbs/gif/index.md'].images.thumb).to.exist
    })

    they('include width and height dimensions', function() {
      const jpg = pages['/thumbs/jpg/index.html'].images.thumb
      expect(jpg.dimensions.width).to.equal(170)
      expect(jpg.dimensions.height).to.equal(170)
    })

    they('include exif data', function(){
      const jpg = pages['/thumbs/jpg/index.html'].images.thumb
      expect(jpg.exif.imageSize.width).to.equal(170)
      expect(jpg.exif.imageSize.height).to.equal(170)
    })

    they('include color data as hex strings', function(){
      var colors = pages['/thumbs/gif/index.md'].images.thumb.colors
      expect(colors).to.be.an('array')
      expect(colors[0]).to.match(/^#[0-9a-f]{3,6}$/i)
    })
  })

  describe('layouts', function(){
    var layouts
    var pages


    before(function(){
      layouts = context.layouts
      pages = context.pages
    })

    they('have a type', function(){
      expect(layouts.default.type).to.equal('layout')
    })

    they('use /layout.html as the default layout, if present', function(){
      var $ = cheerio.load(pages['/index.md'].render(context))
      expect($('html').length).to.equal(1)
      expect($('#default-layout').text()).to.include('I am the fixtures index\n')
    })

    they("can be specified in a page's HTML frontmatter", function(){
      var page = pages['/custom.md']
      expect(page).to.exist
      expect(page.layout).to.equal('simple')
      var $ = cheerio.load(page.render(context))
      expect($('#simple-layout').length).to.equal(1)
    })

    they('are not used if specified layout does not exist', function(){
      var page = pages['/misguided.md']
      expect(page).to.exist
      var $ = cheerio.load(page.render(context))
      expect($('p').length).to.equal(1)
      expect($('body').length).to.equal(0)
    })

    they('are not used if set to `false` in HTML frontmatter', function(){
      var page = pages['/standalone.md']
      expect(page).to.exist
      var $ = cheerio.load(page.render(context))
      expect($('p').length).to.equal(1)
      expect($('#default-layout').length).to.equal(0)
    })

  })

  describe('stylesheets', function(){
    var files

    before(function(){
      files = context.files
    })

    they('have a type', function(){
      expect(files['/styles.scss'].type).to.equal('stylesheet')
    })

    they('can be written in SCSS', function(){
      var styles = files['/styles.scss']
      expect(styles.input).to.include('background: $color;')
      expect(styles.output).to.include('background: green;')
    })

    they('can be written in Sass', function(){
      var styles = files['/styles-sass.sass']
      expect(styles.input).to.include('background: $color')
      expect(styles.output).to.include('background: yellow;')
    })

    describe('written in stylus', function() {

      they('can use variables', function(){
        var styles = files['/styles-stylus.styl']
        expect(styles.input).to.include('background color')
        expect(styles.output).to.include('background: #f00;')
      })

      they('can require other stylus files in the same directory', function(){
        var styles = files['/styles-stylus.styl']
        expect(styles.input).to.include('border-color otherColor')
        expect(styles.output).to.include('border-color: #00f;')
      })

      they('can require stylus files from different directories', function(){
        var styles = files['/styles-stylus.styl']
        expect(styles.input).to.include('font-size fontSize')
        expect(styles.output).to.include('font-size: 1.5rem;')
      })
    })

  })

  describe('scripts', function(){
    var script

    before(function(){
      script = context.files['/babel-and-browserify.js']
    })

    they('have a type', function(){
      expect(script.type).to.equal('script')
    })

    they('browserify', function(){
      expect(script.input).to.include("const url = require('url')")
      expect(script.output).to.include('Url.prototype.parse = function(')
    })

    they('babelify', function(){
      expect(script.input).to.include("`I am an ES2015 string`")
      expect(script.output).to.include("'I am an ES2015 string'")
    })
  })

  describe('data', function(){
    var page
    var output
    var data

    before(function(){
      page = context.pages['/thumbs/index.html']
      output = page.render(context)
      data = page.data
    })

    it("attaches data from JSON files to files in the same directory", function () {
      expect(data.some_json_data.name).to.equal('cookie monster')
      expect(data.some_json_data.food).to.equal('cookies')
    })

    it("attaches data from YML files too", function () {
      expect(data.some_yml_data.name).to.equal('Bert')
      expect(data.some_yml_data.friend).to.equal('Ernie')
    })

    it('injects data into templates', function(){
      expect(output).to.contain('His name is cookie monster')
      expect(output).to.contain('Another character is Bert')
    })

    it('includes the `pages` object in the context', function(){
      expect(output).to.contain('<li class="page">/other</li>')
      expect(output).to.contain('<li class="page">/other/papayas</li>')
    })
  })

})
