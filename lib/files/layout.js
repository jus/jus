'use strict'

const Page = require('./page')

module.exports = class Layout extends Page {
  constructor(filepath, baseDir, cache) {
    super(filepath, baseDir, cache)
    this.name = this.getName()
  }

  getName() {
    if (this.path.name === 'layout') return 'default'

    return this.path.name
      .replace(/layout/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
  }

}
