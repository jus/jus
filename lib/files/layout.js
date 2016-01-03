'use strict'

const fs              = require('fs')
const path            = require('path')
const File            = require('../file')

module.exports = class Layout extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.setName()
    this.read()
    this.squeezed = true
  }

  wrap(content) {
    return this.output.replace('{{{body}}}', content)
  }

  setName() {
    if (this.path.name === 'layout') {
      this.name = 'default'
      return
    }

    this.name = this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }

}
