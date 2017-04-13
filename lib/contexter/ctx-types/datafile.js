'use strict'

const path            = require('upath')

module.exports =  {
  filetypeSteps () {
    // Define the contextualize DO step (and UNDO step)
    this.history.push({
      ctxDO (ctx) {

        // Add file to context in corresponding file type array
        ctx[this.typePlural].push(this)
        // Create named key for easy access also
        ctx[this.typePlural][this.keyName()] = this

      },

      ctxUNDO (ctx) {

        // Remove named keys from corresponding file type array
        delete ctx[this.typePlural][this.keyName()]
        // Remove file also
        ctx[this.typePlural] = ctx[this.typePlural].filter(f => f.path.full !== this.path.full)

      }

    })
  },

  read () {
    // No-op. `Datafile` class should not read files at all. The read ...
    // ... operation is done inside plugin whether is standad or not
    // This function placeholder needs to be here to override `File` class read ()
  },

  // Overrides `File` class default `parseCallback` method to assign `this.data`
  parseCallback (err, output) {
    if (err) throw err

    this.data = output
  },

  keyName () {
    return this.path.relative
  }

}
