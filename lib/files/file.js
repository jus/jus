'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
// TODO: Evaluate removal of BaseFile class
const BaseFile        = require('../module/basefile')

module.exports = class File extends BaseFile {

  constructor(filepath, sourceDir) {
    super(filepath, sourceDir)
    this.setSourcePaths(filepath, sourceDir)
//    this.setHref()
// TODO: move setStats() inside squeeze or other place because does not get called when updateFile()
    this.setStats()
    this.squeeze()
  }

  setSourcePaths(filepath, sourceDir) {
    this.path = {
      full: filepath,
      relative: filepath.replace(sourceDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  render(context, callback) {
    return callback(null, this.output)
  }
}
