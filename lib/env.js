'use strict'

class Env {

  get test() {
    return process.env.NODE_ENV === 'test'
  }

  get development() {
    return process.env.NODE_ENV === 'development'
  }

  get production() {
    return process.env.NODE_ENV === 'production'
  }

}

module.exports = new Env()
