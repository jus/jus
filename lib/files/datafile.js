'use strict'

const fs              = require('fs')
const yaml            = require('js-yaml')
const patterns        = require('../patterns')
const File            = require('../file')

module.exports = class datafile extends File {
  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    if (this.isJSON) this.data = require(this.path.full)
    if (this.isYML) this.data = yaml.safeLoad(fs.readFileSync(this.path.full, 'utf8'))
    this.squeezed = true
  }

  get isJSON() {
    return !!this.path.ext.match(patterns.json)
  }

  get isYML() {
    return !!this.path.ext.match(patterns.yml)
  }

}
