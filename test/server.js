/* globals before, describe, it */

const expect      = require('chai').expect
const path        = require('upath')
const supertest   = require('supertest')
const cheerio     = require('cheerio')
const server      = require('../lib/server')

describe('server', function () {
  this.timeout(10000)

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
          return done()
        })
    })

    it('responds with an object array of file objects', function(){
      expect(context).to.be.an('object')
      expect(context.files).to.exist
      expect(context.pages).to.exist
      expect(context.stylesheets).to.exist
      expect(context.scripts).to.exist
      expect(context.images).to.exist
      expect(context.datafiles).to.exist
      expect(context.layouts).to.exist
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
      expect(page.href).to.equal('/apples')
      expect(page.title).to.equal('Apples!')
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
      expect($('p').text()).to.equal('How do you like them?')
    })

    it('returns an HTML mime type', function(){
      expect(headers['content-type']).to.equal('text/html; charset=utf-8')
    })

  })

  describe('GET /apples?json', function(){
    var page
    var headers

    before(done => {
      supertest(server)
        .get('/apples?json')
        .end((err, res) => {
          page = res.body
          headers = res.headers
          return done()
        })
    })

    it('responds with a JSON object', function(){
      expect(page).to.be.an('object')
      expect(page.title).to.equal('Apples!')
      expect(page.keywords).to.deep.equal(['fruit', 'doctors'])
    })

    it('returns a JSON MIME type', function(){
      expect(headers['content-type']).to.equal('application/json; charset=utf-8')
    })

  })


  describe('GET /apples.json', function(){
    var page
    var headers

    before(done => {
      supertest(server)
        .get('/apples.json')
        .end((err, res) => {
          page = res.body
          headers = res.headers
          return done()
        })
    })

    it('responds with a JSON object', function(){
      expect(page).to.be.an('object')
      expect(page.title).to.equal('Apples!')
      expect(page.keywords).to.deep.equal(['fruit', 'doctors'])
    })

    it('returns a JSON MIME type', function(){
      expect(headers['content-type']).to.equal('application/json; charset=utf-8')
    })

  })


  describe('GET /styles.css', function(){
    var text
    var headers

    before(done => {
      supertest(server)
        .get('/styles.css')
        .end((err, res) => {
          text = res.text
          headers = res.headers
          return done()
        })
    })

    it('has response text containing CSS styles', function(){
      expect(text).to.include('background: green;')
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

  describe('GET 404 HTTP status with Development 404 page', function(){
    var $
    var headers

    before(done => {
      supertest(server)
        .get('/contact.html')
        .expect(404)
        .end((err, res) => {
          $ = cheerio.load(res.text)
          headers = res.headers
          return done()
        })
    })

    it('has response page with title containing "Error 404"', function(){
      expect($('title').text()).to.include('Error 404')
    })

    it('returns a HTML mime type', function(){
      expect(headers['content-type'].toLowerCase()).to.equal('text/html; charset=utf-8')
    })

  })



})
