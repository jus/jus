'use strict'

const fs              = require('fs')
const path            = require('path')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
  }

  squeeze() {
    this.name = this.getName()
    this.readInputFile()
    this.squeezed = true
  }

  getHref() {
    return path.join(this.path.dir, this.path.name)
  }

  getName() {
    if (this.path.name === 'layout') return 'default'

    return this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }
}
