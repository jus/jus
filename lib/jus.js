'use strict'

const fs              = require('fs')
const path            = require('path')
const walkdir         = require('walkdir')
const stringify       = JSON.stringify
const patterns        = require('./patterns')
const associate       = require('./associate')
const Page            = require('./files/page')
const Image           = require('./files/image')
const DataFile        = require('./files/data-file')

module.exports = function jus (baseDir, cb) {
  const cacheFile = path.join(baseDir, '/.jus-cache.json')
  const emitter = walkdir(baseDir)
  var areWeDoneInterval
  var files = []

  try {
    var cache = require(cacheFile)
    console.log(`Found .jus-cache.json`)
  } catch (e) {
    console.log(`Processing files in ${path.basename(baseDir)}`)
  }

  function areWeDone() {
    if (files.every(file => file.isDone)) {
      clearInterval(areWeDoneInterval)
      associate(files)
      // fs.writeFileSync(cacheFile, stringify(files))
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
  })

  emitter.on('end', function () {
    areWeDoneInterval = setInterval(areWeDone, 10)
  })
}
