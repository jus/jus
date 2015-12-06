/* globals describe, it */

const assert = require('assert')
const cheerio = require('cheerio')
const _ = require('lodash')
const jus = require('..')
var files

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    assert.equal(typeof jus, 'function')
  })

  it('takes a directory, then calls back with data', function (done) {
    jus(__dirname + '/fixtures', function (err, _files) {
      assert(!err)
      files = _files
      assert(files)
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

    describe('each file', function () {

      it('has a relative path', function () {
        assert.equal(files['/other/papayas'].path.relative, '/other/papayas.markdown')
      })

      it('ingests HTML frontmatter', function () {
        assert.equal(files['/apples'].title, 'Apples!')
        assert.deepEqual(files['/apples'].keywords, ['fruit', 'doctors'])
      })

      it('converts markdown into HTML in `content.processed`', function () {
        const $ = cheerio.load(files['/other/papayas'].content.processed)
        assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
      })

      it('preserves original content in `content.original`', function () {
        assert.equal(typeof files['/other/papayas'].content.original, 'string')
      })

      describe('`src` attributes in the DOM', function() {
        var content

        before(function() {
          content = files['/other'].content
        })

        it('converts relative', function(){
          assert(~content.original.indexOf('<img src="guava.png">'))
          assert(~content.processed.indexOf('<img src="/other/guava.png">'))

          assert(~content.original.indexOf('<script src="banana.js">'))
          assert(~content.processed.indexOf('<script src="/other/banana.js">'))
        })

        it('ignores absolute', function(){
          assert(~content.original.indexOf('<img src="https://guava.com/logo.png">'))
          assert(~content.processed.indexOf('<img src="https://guava.com/logo.png">'))
        })

        it('ignores protocol-relative', function(){
          assert(~content.original.indexOf('<img src="//guava-relative.com/logo.png">'))
          assert(~content.processed.indexOf('<img src="//guava-relative.com/logo.png">'))
        })

      })

      describe('`href` attributes in the DOM', function() {
        var content

        before(function() {
          content = files['/other'].content
        })

        it('converts relative', function(){
          assert(~content.original.indexOf('<a href="papayas">papayas</a>'))
          assert(~content.processed.indexOf('<a href="/other/papayas">papayas</a>'))
        })

        it('converts relative with leading slash', function(){
          assert(~content.original.indexOf('<a href="/grapes">grapes</a>'))
          assert(~content.processed.indexOf('<a href="/other/grapes">grapes</a>'))
        })

        it('ignores absolute', function(){
          assert(~content.original.indexOf('<a href="http://mango.com">mango.com</a>'))
          assert(~content.processed.indexOf('<a href="http://mango.com">mango.com</a>'))
        })

        it('ignores protocol-relative', function(){
          assert(~content.original.indexOf('<a href="//coconut-cdn.com">coconut-cdn.com</a>'))
          assert(~content.processed.indexOf('<a href="//coconut-cdn.com">coconut-cdn.com</a>'))
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
          // console.log(files['/thumbs/png'])
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

          // const svg = files['/thumbs/svg'].images.thumbnail
          // assert(svg.dimensions)
          // assert.equal(svg.dimensions.width, 170)
          // assert.equal(svg.dimensions.height, 170)
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

          assert(page.content.processed.indexOf('His name is cookie monster') > -1)
          assert(page.content.processed.indexOf('Another character is Bert') > -1)
        })

        it('includes the `pages` object in the context', function(){
          assert(page.content.processed.indexOf('<li class="page">/other</li>') > -1)
          assert(page.content.processed.indexOf('<li class="page">/other/papayas</li>') > -1)
        })
      })

    })
  })
})
