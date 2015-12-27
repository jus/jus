/* globals describe, it */

const assert    = require('assert')
const expect    = require('chai').expect
const cheerio   = require('cheerio')
const _         = require('lodash')
const jus       = require('..')
const they      = it
var context

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    assert.equal(typeof jus, 'function')
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

    it('is an object', function () {
      assert(context)
      assert.equal(typeof context, 'object')
    })

    it('has an array of each primitive', function(){
      assert(Array.isArray(context.files))
      assert(Array.isArray(context.images))
      assert(Array.isArray(context.layouts))
      assert(Array.isArray(context.pages))
      assert(Array.isArray(context.scripts))
      assert(Array.isArray(context.stylesheets))
    })

  })


  describe('files', function() {
    var files

    before(function(){
      files = context.files
    })

    it('is an array', function () {
      assert(Array.isArray(files))
    })

    it('includes .md files', function () {
      assert.equal(files['/apples'].path.ext, '.md')
    })

    it('includes .markdown files', function () {
      assert.equal(files['/other/papayas'].path.ext, '.markdown')
    })

    it('includes .html files', function () {
      assert.equal(files['/oranges'].path.ext, '.html')
    })

    it('removes "index" suffix', function () {
      assert.equal(files['/other'].path.relative, '/other/index.md')
    })

    it('finds the top-level index page', function () {
      assert(files['/'])
    })

    it('finds files regardless of case', function () {
      assert(files['/other/UPPERCASE'])
    })
  })

  describe('pages', function () {
    var pages

    before(function(){
      pages = context.pages
    })

    they('have a relative path', function () {
      assert.equal(pages['/other/papayas'].path.relative, '/other/papayas.markdown')
    })

    they('ingest HTML frontmatter', function () {
      assert.equal(pages['/apples'].title, 'Apples!')
      assert.deepEqual(pages['/apples'].keywords, ['fruit', 'doctors'])
    })

    they('preserve original content in `input`', function () {
      assert.equal(typeof pages['/other/papayas'].input, 'string')
    })

    they('have a cheerio DOM object ($)', function () {
      var $ = pages['/other/papayas'].$
      assert($)
      assert($.text)
      assert($.html)
    })

    they('convert markdown to HTML', function () {
      var $ = pages['/other/papayas'].$
      assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
    })

    describe('`src` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other'].input
        output = pages['/other'].$.html()
      })

      it('converts relative', function(){
        assert(~input.indexOf('<img src="guava.png">'))
        assert(~output.indexOf('<img src="/other/guava.png">'))

        assert(~input.indexOf('<script src="banana.js">'))
        assert(~output.indexOf('<script src="/other/banana.js">'))
      })

      it('ignores relative with leading slash', function(){
        assert(~input.indexOf('<img src="/guava-leading-slashy.png">'))
        assert(~output.indexOf('<img src="/guava-leading-slashy.png">'))
      })

      it('ignores absolute', function(){
        assert(~input.indexOf('<img src="https://guava.com/logo.png">'))
        assert(~output.indexOf('<img src="https://guava.com/logo.png">'))
      })

      it('ignores protocol-relative', function(){
        assert(~input.indexOf('<img src="//guava-relative.com/logo.png">'))
        assert(~output.indexOf('<img src="//guava-relative.com/logo.png">'))
      })

    })

    describe('`href` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other'].input
        output = pages['/other'].$.html()
      })

      it('converts relative', function(){
        assert(~input.indexOf('<a href="papayas">papayas</a>'))
        assert(~output.indexOf('<a href="/other/papayas">papayas</a>'))
      })

      it('ignores relative with leading slash', function(){
        assert(~input.indexOf('<a href="/grapes">grapes</a>'))
        assert(~output.indexOf('<a href="/grapes">grapes</a>'))
      })

      it('ignores absolute', function(){
        assert(~input.indexOf('<a href="http://mango.com">mango.com</a>'))
        assert(~output.indexOf('<a href="http://mango.com">mango.com</a>'))
      })

      it('ignores protocol-relative', function(){
        assert(~input.indexOf('<a href="//coconut-cdn.com">coconut-cdn.com</a>'))
        assert(~output.indexOf('<a href="//coconut-cdn.com">coconut-cdn.com</a>'))
      })

    })

    describe('title', function(){
      it('is derived from HTML frontmatter', function () {
        assert.equal(pages['/apples'].title, 'Apples!')
      })

      it('falls back to <title> tag, if present', function () {
        assert.equal(pages['/oranges'].title, 'We are Oranges')
      })

      it('falls back lastly to titlecased basename', function () {
        assert.equal(pages['/other/papayas'].title, 'Papayas')
      })

      it('injects <title> tag into HTML, if absent', function () {
        assert(~pages['/oranges'].output.indexOf('<title>We are Oranges</title>'))
      })
    })

    describe('isIndex', function(){
      it('is true if file is a directory index', function () {
        assert(pages['/other'].isIndex)
      })
      it('is false if file is NOT a directory index', function () {
        assert(!pages['/other/papayas'].isIndex)
      })
    })
  })

  describe('images', function(){
    var pages

    before(function(){
      pages = context.pages
    })

    it("builds an images object with a key for each image in the page's directory", function () {
      assert.equal(pages['/thumbs/png'].images.thumb.href, '/thumbs/png/thumb.png')
    })

    it('can be an svg', function () {
      assert.equal(pages['/thumbs/svg'].images.thumbnail.href, '/thumbs/svg/thumbnail.svg')
    })

    it('can be a jpg', function () {
      assert.equal(pages['/thumbs/jpg'].images.thumb.href, '/thumbs/jpg/thumb.jpg')
    })

    it('can be a gif', function () {
      assert.equal(pages['/thumbs/gif'].images.thumb.href, '/thumbs/gif/thumb.gif')
    })

    it('includes width and height dimensions for each image', function() {
      const jpg = pages['/thumbs/jpg'].images.thumb
      assert(jpg.dimensions)
      assert.equal(jpg.dimensions.width, 170)
      assert.equal(jpg.dimensions.height, 170)
    })

    it('includes exif data', function(){
      const jpg = pages['/thumbs/jpg'].images.thumb
      assert(jpg.exif)
      assert(jpg.exif.imageSize)
      assert.equal(jpg.exif.imageSize.width, 170)
      assert.equal(jpg.exif.imageSize.height, 170)
    })

    it('includes color data as hex strings', function(){
      var colors = pages['/thumbs/gif'].images.thumb.colors
      assert(Array.isArray(colors))
      assert(colors.length)
      assert(colors[0].match(/^#[0-9a-f]{3,6}$/i))
    })
  })

  describe('layouts', function(){
    var layouts

    before(function(){
      pages = context.pages
      layouts = context.layouts
    })

    it('has a type', function(){
      assert.equal(layouts['/layout'].type, 'layout')
    })

    it('uses /layout.html as the default layout, if present', function(){
      var $ = cheerio.load(pages['/'].render(context))
      assert($('html').length)
      assert.equal($('#default-layout').text(), 'I am the fixtures index\n')
    })

    it('allows custom layout to be set in HTML frontmatter', function(){
      var page = pages['/custom']
      assert(page)
      assert.equal(page.layout, 'simple')
      var $ = cheerio.load(page.render(context))
      assert($('#simple-layout').length)
    })

    it('does not apply layout if custom layout does not exist', function(){
      var page = pages['/misguided']
      assert(page)
      var $ = cheerio.load(page.render(context))
      assert($('p').length)
      assert(!$('body').length)
    })

    it('does not apply layout if set to `false` in HTML frontmatter', function(){
      var page = pages['/standalone']
      assert(page)
      var $ = cheerio.load(page.render(context))
      assert($('p').length)
      assert(!$('#default-layout').length)
    })

  })

  describe('stylesheets', function(){

    it('changes extension to `css` in href', function(){
      var stylesheet = files['/styles.css']
      assert.equal(stylesheet.href, '/styles.css')
      assert.equal(stylesheet.path.ext, '.scss')
    })

    it('has a type', function(){
      assert.equal(files['/styles.css'].type, 'stylesheet')
    })

    it('compiles SCSS', function(){
      var styles = files['/styles.css']
      assert(~styles.input.indexOf('background: $color;'))
      assert(~styles.output.indexOf('background: green;'))
    })

    it('compiles Sass', function(){
      var styles = files['/styles-sass.css']
      assert(~styles.input.indexOf('background: $color'))
      assert(~styles.output.indexOf('background: yellow;'))
    })

    it('compiles Stylus', function(){
      var styles = files['/styles-stylus.css']
      assert(~styles.input.indexOf('background color'))
      assert(~styles.output.indexOf('background: #f00;'))
    })

  })

  describe('scripts', function(){
    var script

    before(function(){
      script = files['/babel-and-browserify.js']
    })

    it('preserves js extension in href', function(){
      assert.equal(script.href, '/babel-and-browserify.js')
    })

    it('has a type', function(){
      assert.equal(script.type, 'script')
    })

    it('browserifies', function(){
      assert(~script.input.indexOf("const url = require('url')"))
      assert(~script.output.indexOf('Url.prototype.parse = function('))
    })

    it('converts ES6 template strings to ES5 regular strings', function(){
      assert(~script.input.indexOf("`I am an ES2015 string`"))
      assert(~script.output.indexOf("'I am an ES2015 string'"))
    })

    it('compiles Sass', function(){
      var styles = files['/styles-sass.css']
      assert(~styles.input.indexOf('background: $color'))
      assert(~styles.output.indexOf('background: yellow;'))
    })

    it('compiles Stylus', function(){
      var styles = files['/styles-stylus.css']
      assert(~styles.input.indexOf('background color'))
      assert(~styles.output.indexOf('background: #f00;'))
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
