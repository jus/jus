'use strict'

const fs              = require('fs-extra')
const path            = require('upath')
// TODO: Evaluate removal of BaseFile class
const BaseFile        = require('../module/basefile')

module.exports = class File extends BaseFile {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
    this.setPaths(filepath, sourceDir, targetDir)
    this.setHref()
// TODO: move setStats() inside squeeze or other place because does not get called when updateFile()
    this.setStats()
    this.squeeze()
  }

  setPaths(filepath, sourceDir, targetDir) {
    this.path = {
      full: filepath,
      relative: filepath.replace(sourceDir, ''),
      processRelative: path.relative(process.cwd(), filepath)
    }

    Object.assign(this.path, path.parse(this.path.relative))

    // TODO: Move targetExt logic to each file type handler
    var targetExt = this.path.ext.toLowerCase()
    if (this.type === 'page') targetExt = '.html'
    if (this.type === 'script') targetExt = '.js'
    if (this.type.indexOf('stylesheet') > -1) targetExt = '.css'

    var targetFull = this.path.full
      .replace(sourceDir, targetDir)
      .replace(this.path.ext, targetExt)

    this.path.target = {
      full: targetFull,
      relative: targetFull.replace(targetDir, '')
    }

    Object.assign(this.path.target, path.parse(this.path.target.relative))
  }

  setHref() {
    this.href = path.join(process.env.JUS_BASEDIR, this.path.target.relative)
  }

  setStats() {
    this.stats = fs.statSync(this.path.full)
  }

  render(context, callback) {
    return callback(null, this.output)
  }

  write(context, done){
    fs.mkdirsSync(path.dirname(this.path.target.full))

    if (this.isSqueezable) {
      return this.render(context, (err, output) => {
        if (err) throw err
        fs.writeFileSync(this.path.target.full, output)
        return done(null)
      })
    }

    if (!this.isRemovable) {
      fs.copySync(this.path.full, this.path.target.full)
    }

    return done(null)
  }

// TODO: Move `isSqueezable()` and `isRemovable()` logic to each file type handler
  get isSqueezable() {
    return [
      'page',
      'script',
      'stylesheetcss',
      'stylesheetless',
      'stylesheetsass',
      'stylesheetscss',
      'stylesheetstyl'
    ].indexOf(this.type) > -1
  }

  get isRemovable() {
    return ['layout'].indexOf(this.type) > -1
  }
}
