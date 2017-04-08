'use strict'

const pluralize       = require('inflection').pluralize
const Filetypes       = require('require-dir')('./filetypes')

module.exports = class Context {
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
  //  ...from the plural of all the filenames on directory provided
  //
  constructor () {
    this.files =  [] // start with `Context.files` array empty

    // ...and empty arrays for `Context.datafiles`, `Context.images`, ...
    Object.keys(Filetypes).forEach((type) => {
      var typePlural = pluralize(type).toLowerCase()
      this[typePlural] = []
    })
  }

  // wrapper to instantiate new files per type without exposing `Filetypes` classes
  newFile (filename, sourceDir, targetDir, plugin) {
    let type = plugin.filetype
    return new Filetypes[type](filename, sourceDir, targetDir, plugin)
  }

  // Finds which of the `Filetypes` does the new plugin serve
  // ...it looks for internal and external cues to find best match
  setFiletype(plugin, pluginFilename) {
    if (plugin.filetype) return plugin.filetype // already defined from code source
    var lookforName = ''

    if (plugin.name) lookforName = plugin.name // maybe the internal name or ...
    if (pluginFilename) lookforName = pluginFilename // optional filename if present

    // Look for each `Filetypes` name in plugins filename or internal name
    let filetype = Object.keys(Filetypes).find(key => {
      // Force to look for all others Filetypes first
      if (key === 'unknown') return false
      return lookforName.toLowerCase().indexOf(key) > -1
    })
    // Special "catch all", if really did not find any
    filetype = filetype || 'unknown'

    plugin.filetype = filetype
  }
}
