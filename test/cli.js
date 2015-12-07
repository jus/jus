/* globals describe, it */

const assert = require('assert')
const nixt = require('nixt')

describe('jus CLI', function () {
  this.timeout(5000)

  it("outputs usage if run without a command", function(done) {
    nixt()
      .run('./lib/cli.js')
      .stdout(/usage/i)
      .end(done)
  })

  describe('jus serve', function(){

    it("starts the server")//, function(done) {
    //   nixt()
    //     .run('./lib/cli.js serve test/fixtures')
    //     .stdout(/foo/i)
    //     .end(done)
    // })
  })


})
