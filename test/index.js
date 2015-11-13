/* globals describe, it */

const assert = require('assert')
const cheerio = require('cheerio')
const _ = require('lodash')
const juicer = require('..')

describe('juicer', function () {
  it('is a function', function () {
    assert.equal(typeof juicer, 'function')
  })

  it('expects a directory and a callback function', function (done) {
    juicer(__dirname + '/fixtures', function (err, content) {
      assert(!err)
      assert(content)
      done()
    })
  })

  describe('sections', function () {
    var sections

    before(function (done) {
      juicer(__dirname + '/fixtures', function (err, content) {
        sections = content.sections
        done()
      })
    })

    it('is an object', function () {
      assert(sections)
      assert.equal(typeof sections, 'object')
    })

    it('has one section for each top-level content directory', function () {
      assert.deepEqual(
        Object.keys(sections),
        ['other', 'thumbs']
      )
    })

    describe('each section', function () {
      it('contains pages', function () {
        assert(sections.other.pages)
        assert.equal(typeof sections.other.pages, 'object')
      })
    })

  })

  describe('pages', function () {
    var pages

    before(function (done) {
      juicer(__dirname + '/fixtures', function (err, content) {
        pages = content.pages
        done()
      })
    })

    it('is an object', function () {
      assert(pages)
      assert.equal(typeof pages, 'object')
    })

    it('includes .md files', function () {
      assert(pages['/apples'])
    })

    it('includes .markdown files', function () {
      assert(pages['/other/papayas'])
    })

    it('includes .html files', function () {
      assert(pages['/oranges'])
    })

    it('removes "index" suffix', function () {
      assert(pages['/other'])
    })

    it('is case insensitive when finding files', function () {
      assert(pages['/other/UPPERCASE'])
    })

    describe('each page', function () {
      it('infers `section` from top-level directory', function () {
        assert.equal(pages['/other/papayas'].section, 'other')
      })

      it('has a relativePath', function () {
        assert.equal(pages['/other/papayas'].relativePath, '/other/papayas.markdown')
      })

      it('ingests HTML frontmatter', function () {
        assert.equal(pages['/apples'].title, 'Apples!')
        assert.deepEqual(pages['/apples'].keywords, ['fruit', 'doctors'])
      })

      it('converts markdown into HTML in `content.processed`', function () {
        const $ = cheerio.load(pages['/other/papayas'].content.processed)
        assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
      })

      it('preserves original content in `content.original`', function () {
        assert.equal(typeof pages['/other/papayas'].content.original, 'string')
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
      })

      describe('isIndex', function(){
        it('is true if file is a directory index', function () {
          assert(pages['/other'].isIndex)
        })
        it('is false if file is NOT a directory index', function () {
          assert(!pages['/other/papayas'].isIndex)
        })
      })

      describe('images', function(){
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

        it('includes width and height dimensions for each image')

        it('includes exif data, if available')

        it('includes color data as chroma-js objects, if available', function(){
          var colors = pages['/thumbs/gif'].images.thumb.colors
          assert(Array.isArray(colors))
          assert(colors.length)
          assert(colors[0].hex().match(/^#[0-9a-f]{3,6}$/i))
        })
      })

      describe('section', function(){
        it('is derived from top-level directory', function () {
          assert.equal(pages['/other/papayas'].section, 'other')
        })

        it('is null for top-level files', function () {
          assert(!pages['/apples'].section)
        })
      })

    })
  })
})
