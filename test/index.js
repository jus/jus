/* globals describe, it */

const assert = require('assert')
const cheerio = require('cheerio')
const chipper = require('..')

describe('chipper', function () {
  it('is a function', function () {
    assert.equal(typeof chipper, 'function')
  })

  it('expects a directory and a callback function', function (done) {
    chipper(__dirname + '/fixtures', function (err, pages) {
      assert(!err)
      assert(pages)
      done()
    })
  })

  describe('pages', function () {
    var pages

    before(function (done) {
      chipper(__dirname + '/fixtures', function (err, _pages) {
        pages = _pages
        done()
      })
    })

    it('is an object', function () {
      assert(pages)
      assert.equal(typeof pages, 'object')
    })

    it('finds .md files', function () {
      assert(pages['/apples'])
    })

    it('finds .markdown files', function () {
      assert(pages['/other/papayas'])
    })

    it('finds .html files', function () {
      assert(pages['/oranges'])
    })

    it('removes "index" suffix', function () {
      assert(pages['/other'])
    })

    it('is case insensitive when finding files', function () {
      assert(pages['/other/UPPERCASE'])
    })

    describe('individual page', function () {
      it('infers `section` from top-level directory', function () {
        assert.equal(pages['/other/papayas'].section, 'other')
      })

      it('preserves `filename`', function () {
        assert.equal(pages['/other/papayas'].filename, '/other/papayas.markdown')
      })

      it('ingests HTML fronmatter', function () {
        assert.equal(pages['/apples'].title, 'Apples')
        assert.deepEqual(pages['/apples'].keywords, ['fruit', 'doctors'])
      })

      it('has HTML `content`', function () {
        const $ = cheerio.load(pages['/other/papayas'].content)
        assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
      })

    })
  })
})
