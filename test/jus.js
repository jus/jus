/* globals describe, it */

const assert = require('power-assert')
const cheerio = require('cheerio')
const _ = require('lodash')
const jus = require('..')
var files
var context

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    assert.equal(typeof jus, 'function')
  })

  it("emits a `squeezed` event when all files have been imported", function (done) {
    jus(__dirname + '/fixtures')
      .on('squeezed', (_files, _context) => {
        assert(_files)
        assert(_context)
        files = _files
        context = _context
        done()
      })
  })

  describe('files', function () {

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

    it('find the top-level index page', function () {
      assert(files['/'])
    })

    it('is case insensitive when finding files', function () {
      assert(files['/other/UPPERCASE'])
    })

    describe('pages', function () {

      it('has a relative path', function () {
        assert.equal(files['/other/papayas'].path.relative, '/other/papayas.markdown')
      })

      it('ingests HTML frontmatter', function () {
        assert.equal(files['/apples'].title, 'Apples!')
        assert.deepEqual(files['/apples'].keywords, ['fruit', 'doctors'])
      })

      it('converts markdown into HTML in `output`', function () {
        const $ = cheerio.load(files['/other/papayas'].output)
        assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
      })

      it('preserves original content in `input`', function () {
        assert.equal(typeof files['/other/papayas'].input, 'string')
      })

      describe('`src` attributes in the DOM', function() {
        var input
        var output

        before(function() {
          input = files['/other'].input
          output = files['/other'].output
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
          input = files['/other'].input
          output = files['/other'].output
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
          assert.equal(files['/apples'].title, 'Apples!')
        })

        it('falls back to <title> tag, if present', function () {
          assert.equal(files['/oranges'].title, 'We are Oranges')
        })

        it('falls back lastly to titlecased basename', function () {
          assert.equal(files['/other/papayas'].title, 'Papayas')
        })

        it('injects <title> tag into HTML, if absent', function () {
          assert(~files['/oranges'].output.indexOf('<title>We are Oranges</title>'))
        })
      })

      describe('isIndex', function(){
        it('is true if file is a directory index', function () {
          assert(files['/other'].isIndex)
        })
        it('is false if file is NOT a directory index', function () {
          assert(!files['/other/papayas'].isIndex)
        })
      })

      describe('images', function(){
        it("builds an images object with a key for each image in the page's directory", function () {
          assert.equal(files['/thumbs/png'].images.thumb.href, '/thumbs/png/thumb.png')
        })

        it('can be an svg', function () {
          assert.equal(files['/thumbs/svg'].images.thumbnail.href, '/thumbs/svg/thumbnail.svg')
        })

        it('can be a jpg', function () {
          assert.equal(files['/thumbs/jpg'].images.thumb.href, '/thumbs/jpg/thumb.jpg')
        })

        it('can be a gif', function () {
          assert.equal(files['/thumbs/gif'].images.thumb.href, '/thumbs/gif/thumb.gif')
        })

        it('includes width and height dimensions for each image', function() {
          const jpg = files['/thumbs/jpg'].images.thumb
          assert(jpg.dimensions)
          assert.equal(jpg.dimensions.width, 170)
          assert.equal(jpg.dimensions.height, 170)
        })

        it('includes exif data', function(){
          const jpg = files['/thumbs/jpg'].images.thumb
          assert(jpg.exif)
          assert(jpg.exif.imageSize)
          assert.equal(jpg.exif.imageSize.width, 170)
          assert.equal(jpg.exif.imageSize.height, 170)
        })

        it('includes color data as hex strings', function(){
          var colors = files['/thumbs/gif'].images.thumb.colors
          assert(Array.isArray(colors))
          assert(colors.length)
          assert(colors[0].match(/^#[0-9a-f]{3,6}$/i))
        })
      })

      describe('layouts', function(){

        it('has a type', function(){
          assert.equal(files['/layout'].type, 'layout')
        })

        it('uses /layout.html as the default layout, if present', function(){
          var $ = cheerio.load(files['/'].output)
          assert($('html').length)
          assert.equal($('#default-layout').text(), 'I am the fixtures index\n')
        })

        it('allows custom layout to be set in HTML frontmatter', function(){
          var page = files['/custom']
          assert(page)
          assert.equal(page.layout, 'simple')
          var $ = cheerio.load(page.output)
          assert($('#simple-layout').length)
        })

        it('does not apply layout if custom layout does not exist', function(){
          var page = files['/misguided']
          assert(page)
          assert(page.output.length)
          var $ = cheerio.load(page.output)
          assert($('p').length)
          assert(!$('body').length)
        })

        it('does not apply layout if set to `false` in HTML frontmatter', function(){
          var page = files['/standalone']
          assert(page)
          assert(page.output.length)
          var $ = cheerio.load(page.output)
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

        before(function(){
          page = files['/thumbs']
        })

        it("attaches data from JSON files to files in the same directory", function () {
          assert.equal(page.data.some_json_data.name, "cookie monster")
          assert.equal(page.data.some_json_data.food, "cookies")
        })

        it("attaches data from YML files too", function () {
          assert.equal(page.data.some_yml_data.name, "Bert")
          assert.equal(page.data.some_yml_data.friend, "Ernie")
        })

        it('injects data into templates', function(){
          assert(page.output.indexOf('His name is cookie monster') > -1)
          assert(page.output.indexOf('Another character is Bert') > -1)
        })

        it('includes the `pages` object in the context', function(){
          assert(page.output.indexOf('<li class="page">/other</li>') > -1)
          assert(page.output.indexOf('<li class="page">/other/papayas</li>') > -1)
        })
      })

    })
  })
})
