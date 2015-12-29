/* globals before, after, describe, it */

const assert      = require('assert')
const expect      = require('chai').expect
const path        = require('path')
const supertest   = require('supertest')
const cheerio     = require('cheerio')
const server      = require('../lib/server')

describe('server', function () {
  this.timeout(5000)

  before(function(done){
    server.start(path.resolve(__dirname, 'fixtures'), done)
  })

  describe('GET /api', function(){
    var context

    before(done => {
      supertest(server)
        .get('/api')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          context = res.body
          context.files.forEach(file => context.files[file.href] = file)
          return done()
        })
    })

    it('responds with a JSON array of file objects', function(){
      var files = context.files
      assert(Array.isArray(files))
      assert(files.length)
      assert(files['/apples'])
      assert(files['/styles.css'])
    })
  })

  describe('GET /api/files/apples', function(){
    var context
    var headers

    before(done => {
      supertest(server)
        .get('/api/files/apples')
        .end((err, res) => {
          context = res.body
          headers = res.headers
          return done()
        })
    })

    it('responds with a specific file object', function(){
      var page = context.page
      assert.equal(page.href, '/apples')
      assert.equal(page.title, 'Apples!')
    })

    it('returns a JSON mime type', function(){
      expect(headers['content-type']).to.equal('application/json; charset=utf-8')
    })

  })

  describe('GET /apples', function(){
    var $
    var headers

    before(done => {
      supertest(server)
        .get('/apples')
        .end((err, res) => {
          $ = cheerio.load(res.text)
          headers = res.headers
          return done()
        })
    })

    it('responds with an HTML page', function(){
      assert.equal($('p').text(), 'How do you like them?')
    })

    it('returns an HTML mime type', function(){
      expect(headers['content-type']).to.equal('text/html; charset=utf-8')
    })

  })

  describe('GET /styles.css', function(){
    var headers

    before(done => {
      supertest(server)
        .get('/styles.css')
        .end((err, res) => {
          headers = res.headers
          return done()
        })
    })

    it('returns a CSS mime type', function(){
      expect(headers['content-type']).to.equal('text/css; charset=utf-8')
    })

  })

  describe('GET /babel-and-browserify.js', function(){
    var headers

    before(done => {
      supertest(server)
        .get('/babel-and-browserify.js')
        .end((err, res) => {
          headers = res.headers
          return done()
        })
    })

    it('returns a JS mime type', function(){
      expect(headers['content-type']).to.equal('application/javascript; charset=utf-8')
    })

  })


  describe('redirects', function() {

    it('redirects', function(done){
      supertest(server)
        .get('/apples-of-yore')
        .expect(301)
        .end((err, res) => {
          expect(res.header['location']).to.equal('/apples')
          return done()
        })
    })
  })

})
