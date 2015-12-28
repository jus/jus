/* globals describe, it */

const expect    = require('chai').expect
const env       = require('../lib/env')

describe('env', function () {

  it('has a `test` getter', function () {
    process.env.NODE_ENV='test'
    expect(env.test).to.be.true
    process.env.NODE_ENV='testy'
    expect(env.test).to.be.false
  })

  it('has a `development` getter', function () {
    process.env.NODE_ENV='development'
    expect(env.development).to.be.true
    process.env.NODE_ENV='developmenty'
    expect(env.development).to.be.false
  })

  it('has a `production` getter', function () {
    process.env.NODE_ENV='production'
    expect(env.production).to.be.true
    process.env.NODE_ENV='productiony'
    expect(env.production).to.be.false
  })

})
