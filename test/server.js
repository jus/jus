/* globals before, describe, it */

const exists      = require('path-exists').sync
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

  describe('GET /jus>api', function(){
    var context

    before(done => {
      supertest(server)
        .get('/jus>api')
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

  describe('GET /jus>api>pages>/apples', function(){
    var context
    var headers

    before(done => {
      supertest(server)
        .get('/jus>api>pages>/apples')
        .end((err, res) => {
          context = res.body
          headers = res.headers
          return done()
        })
    })

    it('responds with a specific file object', function(){
      var page = context
      expect(page.href).to.equal('/apples')
      expect(page.title).to.equal('Apples!')
    })

    it('returns a JSON mime type', function(){
      expect(headers['content-type']).to.equal('application/json; charset=utf-8')
    })

  })

  describe('GET /jus>api>pages>/stones', function(){
    var context
    var headers

    before(done => {
      supertest(server)
        .get('/jus>api>pages>/stones')
        .end((err, res) => {
          context = res.text
          headers = res.headers
          return done()
        })
    })

    it('responds with text representing an empty object "{}"', function(){
      var page = context
      expect(page).to.equal('{}')
    })

    it('returns a JSON mime type', function(){
      expect(headers['content-type']).to.equal('application/json; charset=utf-8')
    })

  })

  describe('GET /jus>api>stylesheets>href=/styles.css', function(){
    var context
    var headers

    before(done => {
      supertest(server)
        .get('/jus>api>stylesheets>href=/styles.css')
        .end((err, res) => {
          context = res.body
          headers = res.headers
          return done()
        })
    })

    it('responds with a specific file object', function(){
      var stylesheet = context
      expect(stylesheet.input).to.include('background: $color;')
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

  describe('reflects sourceDir files in context by adding, updating and deleting them', function(){
    var sourceFile1 = __dirname + '/outsideFixtures/myfruitdata1.json'
    var sourceFile2 = __dirname + '/outsideFixtures/myfruitdata2.json'
    var targetFile = __dirname + '/fixtures/updates/myfruitdata.json'
    var filesCount
    var datafilesCount
    this.timeout(10000)

    before(function(){
      fs.removeSync('./test/fixtures/updates/myfruitdata.json')
    })

    after(function(){
      fs.removeSync('./test/fixtures/updates/myfruitdata.json')
    })


    it('BEFORE ADDING datafile, responds with text representing an empty object "{}"', function(done){
      expect(exists(targetFile)).to.be.false
      supertest(server)
        .get('/jus>api>datafiles>/updates/myfruitdata.json')
        .end((err, res) => {
          expect(res.text).to.equal('{}')
          return done()
        })
    })

    it('get files COUNT and datafiles COUNT', function(done){
      expect(exists(targetFile)).to.be.false
      supertest(server)
        .get('/jus>api')
        .end((err, res) => {
          var context = res.body
//          console.log(context)
          expect(context.files).to.be.an('array')
          filesCount = context.files.length
          datafilesCount = context.datafiles.length
          expect(filesCount).to.be.above(1)
          // return done()  // perform done() until next assertion
          supertest(server)
            .get('/updates/pear')
            .end((err, res) => {
              var text = res.text
              expect(text).not.to.include('with raisins')
              return done() // now we are done
            })
        })
    })

    it('after ADDING one datafile, it is added to context and responds with its data', function(done){
      var runAfterFileCopy = function() {
        supertest(server)
          .get('/jus>api')
          .end((err, res) => {
            var context = res.body
            expect(context.files.length).to.equal(filesCount + 1)
            expect(context.datafiles.length).to.equal(datafilesCount + 1)
            var myData = context.datafiles.find(f => f.href === '/updates/myfruitdata.json')
            expect(myData.data).to.deep.equal({fruitAddOn:"raisins"})
            // return done()  // perform done() until next assertion
            supertest(server)
              .get('/updates/pear')
              .end((err, res) => {
                var text = res.text
                expect(text).to.include('with raisins') // datafile data present
                return done() // now we are done
              })
          })
      }
      fs.copySync(sourceFile1, targetFile)
      expect(exists(targetFile)).to.be.true
      setTimeout(runAfterFileCopy, 500)
    })

    it('after UPDATING datafile, it is updated in context and responds with new data', function(done){
      var runAfterFileCopy = function() {
        supertest(server)
          .get('/jus>api')
          .end((err, res) => {
            var context = res.body
            expect(context.files.length).to.equal(filesCount + 1)
            expect(context.datafiles.length).to.equal(datafilesCount + 1)
            var myData = context.datafiles.find(f => f.href === '/updates/myfruitdata.json')
            expect(myData.data).to.deep.equal({fruitAddOn:"nuts"})
            // return done()  // perform done() until next assertion
            supertest(server)
              .get('/updates/pear')
              .end((err, res) => {
                var text = res.text
                expect(text).to.include('with nuts') // new datafile data present
                return done() // now we are done
              })
          })
      }
      fs.copySync(sourceFile2, targetFile)
      expect(exists(targetFile)).to.be.true
      setTimeout(runAfterFileCopy, 500)
    })

    it('after DELETING file, both COUNTS back to original and responds with no data', function(done){
      var runAfterFileDelete = function() {
        supertest(server)
          .get('/jus>api')
          .end((err, res) => {
            var context = res.body
            expect(context.files).to.be.an('array')
            // back to original number of files in both types
            expect(context.files.length).to.equal(filesCount)
            expect(context.datafiles.length).to.equal(datafilesCount)
            // return done()  // perform done() until next assertion
            supertest(server)
              .get('/updates/pear')
              .end((err, res) => {
                var text = res.text
                expect(text).not.to.include('with raisins') // datafile data gone!
                expect(text).not.to.include('with nuts') // datafile data gone!
                return done() // now we are done
              })
          })
      }
      fs.removeSync('./test/fixtures/updates/myfruitdata.json')
      expect(exists(targetFile)).to.be.false
      setTimeout(runAfterFileDelete, 500)
    })

  })



})
