'use strict'

const fs              = require('fs')
const path            = require('upath')
const frontmatter     = require('../extracter') // enhanced with YAML syntax
const isEmpty         = require('lodash').isEmpty
const File            = require('../file')

module.exports = class Partial extends File {

  constructor(filepath, sourceDir, targetDir) {
    super(filepath, sourceDir, targetDir)
  }

  squeeze() {
    this.squeezed = false
    this.setName()
    this.read()
    this.getFrontmatter()
    this.squeezed = true
  }

  setName() {
    // delete the word 'partial' and all surrounding non word characters if any
    this.name = this.path.name.replace(/\W*partial\W*/i,'')

/*    this.name = this.path.name
      .replace(/partial/i, '')
      .replace(/^(-|_)+/, '')
      .replace(/(-|_)+$/, '')
*/
  }

  getFrontmatter() {
    // Extract any frontmatter from file, if any
    var data = frontmatter(this.input)
    if (!isEmpty(data)) {
      this.data = data
      // Remove frontmatter block to hide when rendered
      this.input = this.input.replace(frontmatter.pattern, '')
    }
  }

  static test(filename) {
    return !!filename.match(/\/.*partial.*\.(html|hbs|handlebars|markdown|md|mdown)$/i)
  }

}
