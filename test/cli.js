/* globals describe, it */

const nixt      = require('nixt')
const exists    = require('path-exists').sync
const expect    = require('chai').expect
const fse        = require('fs-extra')
const pkg       = require('../package.json')

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

  it("builds", function(done) {
    nixt()
      .run('rm -rf test/fixtures-build')
      .run('./cli.js build test/fixtures test/fixtures-build')
      .stdout(pkg.version)
      .end(function(){
        var sourceFile = './test/fixtures/index.md'
        expect(exists(sourceFile)).to.equal(true)

        var targetFile = './test/fixtures-build/index.html'
        expect(exists(targetFile)).to.equal(true)

        fse.removeSync('./test/fixtures-build')
        done()
      })
  })
})
