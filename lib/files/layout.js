'use strict'

const fs              = require('fs')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
  }

  squeeze() {
    this.name = this.getName()
    this.input = fs.readFileSync(this.path.full, 'utf8')
    this.squeezed = true
  }

  getName() {
    if (this.path.name === 'layout') return 'default'

    return this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }
}
