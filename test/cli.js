/* globals describe, it, beforeEach, afterEach */

const nixt      = require('nixt')
const exists    = require('path-exists').sync
const expect    = require('chai').expect
const fs        = require('fs-extra')
const cheerio   = require('cheerio')
const pkg       = require('../package.json')

describe('app CLI', function () {
  this.timeout(60000)

  it("outputs usage if run without a command", function(done) {
    nixt()
      .run('node cli.js')
      .stdout(/Serve the current directory/i)
      .stdout(/Serve a specific directory/i)
      .end(done)
  })

  it("outputs package version if -v flag is passed", function(done) {
    nixt()
      .run('node cli.js -v')
      .stdout(pkg.version)
      .end(done)
  })

  describe('build', function(){

    beforeEach(function(){
      fs.removeSync('./test/builds')
    })

    afterEach(function(){
      fs.removeSync('./test/builds')
    })

    it("builds files in the target directory", function(done) {
      nixt()
        .run('node cli.js build test/fixtures test/builds/basic')
        .end(function(){
          expect(exists('./test/fixtures/index.md')).to.equal(true)
          expect(exists('./test/builds/basic/index.html')).to.equal(true)
          done()
        })
    })

    it("prepends basedir to relative paths, if --basedir option is present", function(done) {
      nixt()
        .run('node cli.js build test/fixtures test/builds/basey --basedir foo-project')
        .end(function(){
          const page = './test/builds/basey/index.html'
          expect(exists(page)).to.equal(true)

          const $ = cheerio.load(fs.readFileSync(page, 'utf8'))
          expect($('a[href="foo-project/other/nested/coconut"]').length).to.equal(1)
          done()
        })
    })

    // it("ignores files in the target directory, if it is a child of the source directory", function(done) {
    //   nixt()
    //     .run('mkdirp ./cli.js build test/fixtures test/fixtures/thumbs')
    //     .run('./cli.js build test/fixtures test/fixtures/thumbs')
    //     .end(function(){
    //       const page = './test/builds/basey/index.html'
    //       expect(exists(page)).to.equal(true)
    //
    //       const $ = cheerio.load(fs.readFileSync(page, 'utf8'))
    //       expect($('a[href="foo-project/other/nested/coconut"]').length).to.equal(1)
    //       done()
    //     })
    // })

  })

})
