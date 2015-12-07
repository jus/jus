/* globals before, after, describe, it */

const assert    = require('assert')
const supertest = require('supertest')
const server    = require('../lib/server')

describe('server', function () {
  this.timeout(5000)

  before(function(){
    process.env.JUS_DIR = './test/fixtures'
    console.log('I just set process.env.JUS_DIR')
    server.jus()
  })

  // after(function(){
  //   delete process.env.JUS_DIR
  // })

  describe('GET /api/files', function(){
    it('responds with json', function(done){
      supertest(server)
        .get('/api/files')
        // .set('Accept', 'application/json')
        // .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          console.log(res)
          done()
        })
    })
  })

  // describe('GET /files', function(){
  //   it('responds with json', function(done){
  //     supertest(server)
  //       .get('/files')
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(200, done)
  //   })
  // })


})
