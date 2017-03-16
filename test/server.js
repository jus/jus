/* globals before, describe, it */

const expect      = require('chai').expect
const fs          = require('fs-extra')
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


  describe.skip('GET /apples.json', function(){
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
    const PAGE_TITLE = 'Error 404'
    const MISSING_HREF = '/contact.html'
    var $
    var headers
    var text

    before(done => {
      supertest(server)
        .get(MISSING_HREF)
        .expect(404)
        .end((err, res) => {
          text = res.text
          $ = cheerio.load(text)
          headers = res.headers
          return done()
        })
    })

    it('returns a HTML mime type', function(){
      expect(headers['content-type'].toLowerCase()).to.equal('text/html; charset=utf-8')
    })

    it('has response page with title containing "' + PAGE_TITLE + '"', function(){
      expect($('title').text()).to.include(PAGE_TITLE)
    })

    it('has response text containing the missing href', function(){
      expect(text).to.include(MISSING_HREF)
    })

  })

  // Steps to test refresh datafile in page object
  // (server is running so squeezing files happens immediately after updating them)
  // Inquire 'page' object to obtain actual data and save as 'original'
  // Update 'always-changing-data.json' file with different data
  // Cycle inquiring 'page' object until 'squeezed' to obtain updated data as 'updated'
  // Assert that they are different
  describe('Refresh datafile in page object', function(){
    const DATAFILE_HREF = '/always-changing-data.json'
    const DATAFILE_PATH = path.resolve(__dirname, 'fixtures', '.' + DATAFILE_HREF)
    var context
    var datafile
    var original
    var updated

    before(done => {
      supertest(server)
        .get('/api/files')
        .end((err, res) => {
          context = res.body
          datafile = context.datafiles.filter(file => file.href === DATAFILE_HREF)[0]
          original = datafile.data.today
          var different = original === 'sunny' ? 'rainy' : 'sunny'
          fs.writeJsonSync(DATAFILE_PATH, {today: different})
          return done()
        })
    })

    it('got valid original data', function(){
      expect(['sunny', 'rainy']).to.include(original)
    })

    describe('GET data from updated (and squeezed) datafile', function(){

      // Polls `datafile.squeezed` every 1s
      var check = function(done) {
        supertest(server)
          .get('/api/files')
          .end((err, res) => {
            context = res.body
            datafile = context.datafiles.filter(file => file.href === DATAFILE_HREF)[0]
            if (datafile.squeezed) {
              // Keep the 'squeezed' flag false to avoid any race condition
              datafile.squeezed = false
              done()
            }
            else setTimeout( function(){ check(done) }, 1000 );
          })
      }

      before(function( done ){
        check( done );
      });

      it('got valid updated data (and different than the original)', function(){
        updated = datafile.data.today
        // Reset file to default value before expectations
        // ...to prevent any test failure case
        fs.writeJsonSync(DATAFILE_PATH, {today: "rainy"})
        expect(['sunny', 'rainy']).to.include(updated)
        expect(updated).to.not.equal(original)
      })
    })

  })

})
