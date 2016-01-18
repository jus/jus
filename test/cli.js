/* globals describe, it */

const nixt = require('nixt')
const pkg = require('../package.json')

describe('jus CLI', function () {
  this.timeout(5000)

  it("outputs usage if run without a command", function(done) {
    nixt()
      .run('./cli.js')
      .stdout(/Serve the current directory/i)
      .stdout(/Serve a specific directory/i)
      .end(done)
  })

  it("outputs package version if -v flag is passed", function(done) {
    nixt()
      .run('./cli.js -v')
      .stdout(pkg.version)
      .end(done)
  })
})
