'use strict'

const path            = require('upath')
const File            = require('../file')

module.exports = class Script extends File {

  constructor(filepath, sourceDir, targetDir, plugin) {
    super(filepath, sourceDir, targetDir, plugin)
  }

// TODO: Modify script tests to NOT use `this.input` (meaning file.input) ...
// ... because this `read()` override fails. It needs to be commented but ...
//... `this.input` is really never used in `jus`, it is just present in the ...
//... tests for tests convenience.
/*
  read () {
    // No-op. `Script` class should not read files at all. The read ...
    // ... operation is done inside plugin whether is standad or not
    // This function placeholder needs to be here to override `File` class read ()
  }
*/
}
