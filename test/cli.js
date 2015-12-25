/* globals describe, it */

const assert = require('assert')
const nixt = require('nixt')

describe('jus CLI', function () {

  it("outputs usage if run without a command", function(done) {
    nixt()
      .run('./bin/cmd.js')
      .stdout(/usage/i)
      .end(done)
  })

  // describe('environment', function(){
  //
  //   describe('port', function() {
  //     it("defaults to 3000")
  //     it("can be overridden with --port")
  //     it("can be overridden with -p")
  //   })
  //
  // })
  //
  // describe('jus server', function(){
  //
  //   it("starts the server"), function(done) {
  //     nixt()
  //       .run('./bin/cmd.js serve test/fixtures')
  //       .stdout(/Juicing/i)
  //       .end(done)
  //   })
  //
  // })

})
