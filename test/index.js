/* globals describe, it */

const assert = require('assert')
const cheerio = require('cheerio')
const _ = require('lodash')
const chipper = require('..')

describe('chipper', function () {
  it('is a function', function () {
    assert.equal(typeof chipper, 'function')
  })

  it('expects a directory and a callback function', function (done) {
    chipper(__dirname + '/fixtures', function (err, content) {
      assert(!err)
      assert(content)
      done()
    })
  })

  describe('sections', function () {
    var sections

    before(function (done) {
      chipper(__dirname + '/fixtures', function (err, content) {
        sections = content.sections
        console.log(sections)
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
        ['other']
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
      chipper(__dirname + '/fixtures', function (err, content) {
        pages = content.pages
        // console.log(_.pick(pages, ['title', 'filename']))
        // console.log(pages)
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

    describe('each page', function () {
      it('infers `section` from top-level directory', function () {
        assert.equal(pages['/other/papayas'].section, 'other')
      })

      it('preserves `filename`', function () {
        assert.equal(pages['/other/papayas'].filename, '/other/papayas.markdown')
      })

      it('ingests HTML fronmatter', function () {
        assert.equal(pages['/apples'].title, 'Apples!')
        assert.deepEqual(pages['/apples'].keywords, ['fruit', 'doctors'])
      })

      it('converts markdown into HTML `content`', function () {
        const $ = cheerio.load(pages['/other/papayas'].content)
        assert.equal($('a[href="https://digestion.com"]').text(), 'digestion')
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

      // describe('isIndex', function(){
      //   it('is true if file is a directory index', function () {
      //     assert(pages['/other'].isIndex)
      //   })
      //   it('is false if file is NOT a directory index', function () {
      //     assert.fail(pages['/other/papayas'].isIndex)
      //   })
      // })

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
