'use strict'

const fs              = require('fs')
const path            = require('path')
const walkdir         = require('walkdir')
const Cache           = require('./cache')
const patterns        = require('./patterns')
const associate       = require('./associate')
const Page            = require('./files/page')
const Image           = require('./files/image')
const DataFile        = require('./files/data-file')
const Stylesheet      = require('./files/stylesheet')

module.exports = function jus (baseDir, cb) {
  const cache = Cache.new(baseDir)
  const emitter = walkdir(baseDir)
  var areWeDoneInterval
  var files = []

  function areWeDone() {
    if (files.every(file => file.isDone)) {
      clearInterval(areWeDoneInterval)
      associate(files)
      cache.write(files)
      cb(null, files)
    }
  }

  emitter.on('file', function (filepath, stat) {
    if (filepath.match(patterns.blacklist)) return

    if (filepath.match(patterns.page)) {
      files.push(new Page(filepath, baseDir, cache))
    }

    if (filepath.match(patterns.image)) {
      files.push(new Image(filepath, baseDir, cache))
    }

    if (filepath.match(patterns.dataFile)) {
      files.push(new DataFile(filepath, baseDir, cache))
    }

    if (filepath.match(patterns.stylesheet)) {
      files.push(new Stylesheet(filepath, baseDir, cache))
    }
  })

  emitter.on('end', function () {
    areWeDoneInterval = setInterval(areWeDone, 10)
  })
}
