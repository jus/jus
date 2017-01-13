'use strict'

const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = class Context {
  //
  //  Create an empty holding structure like:
  //
  //   {
  //      files: [],
  //      datafiles: [],
  //      images: [],
  //      layouts: [],
  //      partials: [],
  //      scripts: [],
  //      stylesheets: [],
  //      unknowns: []
  //  }
  //
  //  ...from the plural of all the filenames on directory /lib/files
  //
  //  (...more info below)
  //
  constructor () {
    this.files =  [] // start with files [] already an add the others
    Object.keys(primitives).forEach(type => {
      const t = pluralize(type)
      this[t] = [] // add key to object and initialize its value to an empty array
    })
  }
}
//
// This structure will be used to hold all the data related and extracted from
// the user files.
// The structure is organized by file's type.
// If you want to add a new type, you need to add a script with the new class
// in the directory /lib/files so this structure will have a new key named
// by your new script filename
//
// Every time a new file is added, it is added in four places. One in the
// `files` array, second in the same array but under a named key for easy access
// by handlebars, third in its type array (ex. `stylesheets`) and finally again
// added in the same type array but also under a named key.
//
// ex. If a user stylesheet is added, it is added in `files` array twice AND
//     also added to `stylesheets` array twice.
//
// Every modfication like updating or deleting user files is also done in four
// places to reflect this behaivor.
