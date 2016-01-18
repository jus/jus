/* globals describe, it */

const nixt = require('nixt')

describe('jus CLI', function () {
  this.timeout(5000)

  it("outputs usage if run without a command", function(done) {
    nixt()
      .run('./cli.js')
      .stdout(/usage/i)
      .end(done)
  })

})
