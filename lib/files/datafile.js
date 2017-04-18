'use strict'

const path            = require('upath')
const snakeCase       = require('lodash').snakeCase

module.exports =  {
  filetypeSteps () {
    // Define the contextualize DO step (and UNDO step)
    this.recipe.push({
      ctxDO (ctx) {

        // Attach this datafile data to all pages in the same directory
        ctx.pages.forEach(page => {
          if (page.path.dir === this.path.dir) {
            if (!page.data) page.data = {} // It is the first of its type in the page
            page.data[this.path.name] = this.data
          }
        })

      },

      ctxUNDO (ctx) {

        // Remove this datafile data from all pages in the same directory
        ctx.pages.forEach(page => {
          if (page.path.dir === this.path.dir && page.data) {
            delete page.data[this.path.name]
          }
        })

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

  // TODO: Consider moving this `Datafile keyName()` override to plugin
  keyName () {
    return snakeCase(`${this.path.dir}_${this.path.name}`)
  }

}
