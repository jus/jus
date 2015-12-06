'use strict'

const path            = require('path')
const fs              = require('fs')
const stringify       = JSON.stringify

module.exports = class Cache {
  constructor(baseDir) {
    this.dir = baseDir
    this.file = path.join(baseDir, '/.jus-cache.json')

    try {
      this.files = require(this.file)
      this.files.forEach(file => this.files[file.href] = file)
      console.log(`Found .jus-cache.json`)
    } catch (e) {
      this.files = []
      console.log(`Juicing files anew`)
    }
  }

  get(file) {
    const cached = this.files[file.href]
    if (cached && stringify(cached.stats.mtime) === stringify(file.stats.mtime)) return cached
  }

  write(files) {
    fs.writeFileSync(this.file, stringify(files, null, 2))
  }

  static new(baseDir) {
    return new Cache(baseDir)
  }
}
