'use strict'

const pluralize       = require('inflection').pluralize
const File            = require('./file')

var filetypes

module.exports = class Context {
  constructor (_filetypes) {
    filetypes = _filetypes
    //
    //  Create holding structure like:
    //
    //   {
    //      files: [],
    //      datafiles: [],
    //      images: []
    //      ...
    //  }
    //
    // ... from the plural of all keys in filetypes, if any. Commonly, at ...
    // ... least the included basic types (folder `ctx-types`)
    Object.keys(filetypes).forEach((type) => {
      var typePlural = pluralize(type).toLowerCase()
      this[typePlural] = []
    })

  }

  // wrapper to instantiate new files per type without exposing `Filetypes` classes
  newFile (filename, sourceDir, targetDir, plugin, targetExt) {
    const type = plugin.filetype
    const newFile = new File(filename, sourceDir)
    const payload = filetypes[type]

    // If there is a custom file type to override the basic file type ...
    // ... `file`, then inject it before injecting the plugin type. This is ...
    // ... like "common" properties and methods for all custom file types ...
    // ... to avoid duplicating code per each custom file type
    if (filetypes.file)  Object.keys(filetypes.file).forEach(key => {
        newFile[key] = filetypes.file[key]
      })

    // Inject custom filetype properties and methods
    Object.keys(payload).forEach(key => {
      if (key === 'file') return // skip it, has been injected already above
      newFile[key] = payload[key]
    })

    // squeeze it but not contextualize it yet
    newFile.initialize(plugin, targetDir, targetExt)

    return newFile
  }

}
