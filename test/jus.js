/* globals describe, it */

const expect    = require('chai').expect
const cheerio   = require('cheerio')
const _         = require('lodash')
const jus       = require('..')
const they      = it
var context

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    expect(jus).to.be.a('function')
  })

  it("emits a `squeezed` event when all files have been imported", function (done) {
    jus(__dirname + '/fixtures')
      .on('squeezed', (_context) => {
        context = _context
        files = context.files
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

    they('include .md files', function () {
      expect(files['/apples'].path.ext).to.equal('.md')
    })

    they('include .markdown files', function () {
      expect(files['/other/papayas'].path.ext).to.equal('.markdown')
    })

    they('include .html files', function () {
      expect(files['/oranges'].path.ext).to.equal('.html')
    })

    they('have and href with the "index" suffix removed', function () {
      expect(files['/other'].path.relative).to.equal('/other/index.md')
    })

    they('have a root-level href', function () {
      expect(files['/']).to.exist
    })

    they('are loaded regardless of case', function () {
      expect(files['/other/UPPERCASE']).to.exist
    })

    they('have target filenames', function () {
      expect(files['/apples'].path.target.relative).to.equal('/apples.html')
      expect(files['/styles.css'].path.target.relative).to.equal('/styles.css')
      expect(files['/babel-and-browserify.js'].path.target.relative).to.equal('/babel-and-browserify.js')
    })

    they('have target extensions', function () {
      expect(files['/apples'].path.target.ext).to.equal('.html')
      expect(files['/styles.css'].path.target.ext).to.equal('.css')
      expect(files['/babel-and-browserify.js'].path.target.ext).to.equal('.js')
    })
  })

  describe('pages', function () {
    var pages

    before(function(){
      pages = context.pages
    })

    they('have a relative path', function () {
      expect(pages['/other/papayas'].path.relative).to.equal('/other/papayas.markdown')
    })

    they('ingest HTML frontmatter', function () {
      expect(pages['/apples'].title).to.equal('Apples!')
      expect(pages['/apples'].keywords).to.deep.equal(['fruit', 'doctors'])
    })

    they('preserve original content in `input`', function () {
      expect(pages['/other/papayas'].input).to.be.a('string')
    })

    they('have a cheerio DOM object ($)', function () {
      var $ = pages['/other/papayas'].$
      expect($).to.exist
      expect($.text).to.be.a('function')
      expect($.html).to.be.a('function')
    })

    they('convert markdown to HTML', function () {
      var $ = pages['/other/papayas'].$
      expect($('a[href="https://digestion.com"]').text()).to.equal('digestion')
    })

    they('get a titlecased version of their filename as a title, if not set', function () {
      var page = pages['/other/papayas']
      var $ = page.$
      expect(page.title).to.equal('Papayas')

      // <title> tag is set after render
      var $ = cheerio.load(page.render(context))
      expect($('title').text()).to.equal('Papayas')
    })

    describe.skip('`src` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other'].input
        output = pages['/other'].$.html()
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

    describe.skip('`href` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other'].input
        output = pages['/other'].$.html()
      })

      it('converts relative', function(){
        expect(input).to.include('<a href="papayas">papayas</a>')
        expect(output).to.include('<a href="/other/papayas">papayas</a>')
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
        expect(pages['/apples'].title).to.equal('Apples!')
      })

      it('falls back to <title> tag, if present', function () {
        expect(pages['/oranges'].title).to.equal('We are Oranges')
      })

      it('falls back lastly to titlecased basename', function () {
        expect(pages['/other/papayas'].title).to.equal('Papayas')
      })

      it('injects <title> tag into HTML, if absent', function () {
        expect(pages['/oranges'].output).to.include('<title>We are Oranges</title>')
      })
    })

    describe('isIndex', function(){
      it('is true if file is a directory index', function () {
        expect(pages['/other'].isIndex).to.be.true
      })
      it('is false if file is NOT a directory index', function () {
        expect(pages['/other/papayas'].isIndex).to.be.false
      })
    })
  })

  describe('images', function(){
    var pages

    before(function(){
      pages = context.pages
    })

    it("are attached to pages in the same directory", function () {
      expect(pages['/thumbs/png'].images.thumb.href).to.equal('/thumbs/png/thumb.png')
    })

    they('can be SVGs', function () {
      expect(pages['/thumbs/svg'].images.thumbnail.href).to.equal('/thumbs/svg/thumbnail.svg')
    })

    they('can be JPGs', function () {
      expect(pages['/thumbs/jpg'].images.thumb.href).to.equal('/thumbs/jpg/thumb.jpg')
    })

    they('can be GIFs', function () {
      expect(pages['/thumbs/gif'].images.thumb.href).to.equal('/thumbs/gif/thumb.gif')
    })

    they('include width and height dimensions', function() {
      const jpg = pages['/thumbs/jpg'].images.thumb
      expect(jpg.dimensions.width).to.equal(170)
      expect(jpg.dimensions.height).to.equal(170)
    })

    they('include exif data', function(){
      const jpg = pages['/thumbs/jpg'].images.thumb
      expect(jpg.exif.imageSize.width).to.equal(170)
      expect(jpg.exif.imageSize.height).to.equal(170)
    })

    they('include color data as hex strings', function(){
      var colors = pages['/thumbs/gif'].images.thumb.colors
      expect(colors).to.be.an('array')
      expect(colors[0]).to.match(/^#[0-9a-f]{3,6}$/i)
    })
  })

  describe('layouts', function(){
    var layouts

    before(function(){
      pages = context.pages
      layouts = context.layouts
    })

    they('have a type', function(){
      expect(layouts['/layout'].type).to.equal('layout')
    })

    they('use /layout.html as the default layout, if present', function(){
      var $ = cheerio.load(pages['/'].render(context))
      expect($('html').length).to.equal(1)
      expect($('#default-layout').text()).to.include('I am the fixtures index\n')
    })

    they("can be specified in a page's HTML frontmatter", function(){
      var page = pages['/custom']
      expect(page).to.exist
      expect(page.layout).to.equal('simple')
      var $ = cheerio.load(page.render(context))
      expect($('#simple-layout').length).to.equal(1)
    })

    they('are not used if specified layout does not exist', function(){
      var page = pages['/misguided']
      expect(page).to.exist
      var $ = cheerio.load(page.render(context))
      expect($('p').length).to.equal(1)
      expect($('body').length).to.equal(0)
    })

    they('are not used if set to `false` in HTML frontmatter', function(){
      var page = pages['/standalone']
      expect(page).to.exist
      var $ = cheerio.load(page.render(context))
      expect($('p').length).to.equal(1)
      expect($('#default-layout').length).to.equal(0)
    })

  })

  describe('stylesheets', function(){

    they('have a `.css` extension in their href', function(){
      var stylesheet = files['/styles.css']
      expect(stylesheet.href).to.equal('/styles.css')
      expect(stylesheet.path.ext).to.equal('.scss')
    })

    they('have a type', function(){
      expect(files['/styles.css'].type).to.equal('stylesheet')
    })

    they('can be written in SCSS', function(){
      var styles = files['/styles.css']
      expect(styles.input).to.include('background: $color;')
      expect(styles.output).to.include('background: green;')
    })

    they('can be written in Sass', function(){
      var styles = files['/styles-sass.css']
      expect(styles.input).to.include('background: $color')
      expect(styles.output).to.include('background: yellow;')
    })

    they('can be written in Stylus', function(){
      var styles = files['/styles-stylus.css']
      expect(styles.input).to.include('background color')
      expect(styles.output).to.include('background: #f00;')
    })

  })

  describe('scripts', function(){
    var script

    before(function(){
      script = files['/babel-and-browserify.js']
    })

    they('preserve js extension in href', function(){
      expect(script.href).to.equal('/babel-and-browserify.js')
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
      page = pages['/thumbs']
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
