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

    before(done => {
      supertest(server)
        .get('/api/files/apples')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          context = res.body
          return done()
        })
    })

    it('responds with a specific file object', function(){
      var page = context.page
      assert.equal(page.href, '/apples')
      assert.equal(page.title, 'Apples!')
    })

  })

  describe('GET /apples', function(){
    var $

    before(done => {
      supertest(server)
        .get('/apples')
        .expect(200)
        .end((err, res) => {
          $ = cheerio.load(res.text)
          return done()
        })
    })

    it('responds with an HTML page', function(){
      assert.equal($('p').text(), 'How do you like them?')
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
