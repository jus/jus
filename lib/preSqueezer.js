const fs              = require('fs')
const path            = require('upath')
const extensions      = require('./extensions')
const fileTypes       = require('require-dir')('./files')

module.exports = class PreSqueezer {
  constructor (emitter, files, sourceDir, targetDir) {
    this.emitter = emitter
    this.files = files
    this.sourceDir = sourceDir
    this.targetDir = targetDir
  }

  subscribe (destination) {
    this.destination = destination
  }

  next (e) {
    console.log(e.filename)
    switch (e.cmd) {
      case 'add':
        this._addFile(e.filename)
        break;
      case 'update':
        this._updateFile(e.filename)
        break;
      case 'delete':
        this._deleteFile(e.filename)
        break;
      default:
        throw 'preSqueezer error: Bad next event command'
    }
  }

  subscribe (observer) {
      this.onNext = observer.next
    return
  }

  _addFile (filename) {
    var file
    var ext = path.extname(filename).toLowerCase().slice(1)
    var type = extensions[ext]

    if (fileTypes.layout.test(filename)) type = 'layout'
    if (filename.endsWith('.min.js')) type = 'unknown'
    if (ext === 'svg') {
      if (fs.readFileSync(filename, 'utf8').includes('</font>')) type = 'unknown'
    }
    if (!type) type = 'unknown'

    file = new fileTypes[type](filename, this.sourceDir, this.targetDir)
    this.emitter.emit('file-add', file)
    this.files.push(file)
  }

  _updateFile (filename) {
    var file = this.files.find(f => f.path.full === filename)
    file.squeeze()
    this.emitter.emit('file-update', file)
  }

  _deleteFile (filename) {
    var file = this.files.find(f => f.path.full === filename)
    this.files = this.files.filter(f => f.path.full !== filename)
    this.emitter.emit('file-delete', file)
  }
}
