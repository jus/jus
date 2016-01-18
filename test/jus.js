/* globals describe, it */

const expect    = require('chai').expect
const cheerio   = require('cheerio')
const tmp       = require('tmp')
const exists    = require('path-exists').sync
const jus       = require('..')
const they      = it
const test      = it

const sourceDir = __dirname + '/fixtures'
const targetDir = tmp.dirSync().name
var context

describe('jus', function () {
  this.timeout(5000)

  it('is a function', function () {
    expect(jus).to.be.a('function')
  })

  it("emits a series of lifecycle events, ultimately emitting a squeezed context object", function (done) {
    var events = []
    jus(sourceDir, targetDir)
      .on('started', () => events.push('started'))
      .on('squeezing', () => events.push('squeezing'))
      .on('squeezed', (_context) => {
        expect(events).to.deep.equal(['started', 'squeezing'])
        context = _context
        done()
      })
  })

  describe('context', function() {

    it('is an object returned by the `squeezed` event', function () {
      expect(context).to.exist
      expect(context).to.be.an('object')
    })

    it('has an array for each primitive: files, images, layouts, pages, unknowns, etc..', function(){
      expect(context.files).to.be.an('array')
      expect(context.images).to.be.an('array')
      expect(context.layouts).to.be.an('array')
      expect(context.pages).to.be.an('array')
      expect(context.scripts).to.be.an('array')
      expect(context.stylesheets).to.be.an('array')
      expect(context.unknowns).to.be.an('array')
    })
  })

  describe('files', function() {
    var files

    before(function(){
      files = context.files
    })

    they('are in an array', function () {
      expect(files).to.be.an('array')
    })

    they('are sometimes ignored', function(){
      var file = __dirname + '/fixtures/redirects.json'
      expect(exists(file)).to.be.true

      var filenames = files.map(f => f.path.relative)
      expect(filenames).to.contain('/index.md')
      expect(filenames).to.not.contain('/redirects.json')
    })

    describe('path', function() {
      it('is an object with a bunch of sliced and diced info about the filename', function(){
        var path = files['/apples.md'].path
        expect(path.full).to.include('/test/fixtures/apples.md')
        expect(path.relative).to.equal('/apples.md')
        expect(path.processRelative).to.equal('test/fixtures/apples.md')
        expect(path.root).to.equal('/')
        expect(path.dir).to.equal('/')
        expect(path.base).to.equal('apples.md')
        expect(path.ext).to.equal('.md')
        expect(path.name).to.equal('apples')

        expect(path.target.relative).to.equal('/apples.html')
        expect(path.target.full).to.equal(`${targetDir}/apples.html`)
        expect(path.target.ext).to.equal(`.html`)
      })

      it('includes target.relative', function () {
        expect(files['/apples.md'].path.target.relative).to.equal('/apples.html')
        expect(files['/styles.scss'].path.target.relative).to.equal('/styles.css')
        expect(files['/babel-and-browserify.js'].path.target.relative).to.equal('/babel-and-browserify.js')
      })

      it('includes target.full', function () {
        expect(files['/apples.md'].path.target.full).to.equal(`${targetDir}/apples.html`)
        expect(files['/styles.scss'].path.target.full).to.equal(`${targetDir}/styles.css`)
        expect(files['/babel-and-browserify.js'].path.target.full).to.equal(`${targetDir}/babel-and-browserify.js`)
      })

      it('includes target.ext', function () {
        expect(files['/apples.md'].path.target.ext).to.equal('.html')
        expect(files['/styles.scss'].path.target.ext).to.equal('.css')
        expect(files['/babel-and-browserify.js'].path.target.ext).to.equal('.js')
      })
    })
  })

  describe('unknowns', function () {
    var unknowns
    var filenames

    before(function(){
      unknowns = context.unknowns
      filenames = unknowns.map(f => f.path.relative)
    })

    they('include extensionless files like CNAME', function(){
      expect(filenames).to.contain('/CNAME')
    })

    they('include zip files', function(){
      expect(filenames).to.contain('/archive.zip')
    })
  })

  describe('pages', function () {
    var pages

    before(function(){
      pages = context.pages
    })

    they('have a "clean URL" href', function () {
      expect(pages['/apples.md'].href).to.equal('/apples')
    })

    they('have a "clean URL" href', function () {
      expect(pages['/thumbs/index.html'].href).to.equal('/thumbs')
    })

    they('include .md files', function () {
      expect(pages['/apples.md']).to.exist
    })

    they('include .markdown files', function () {
      expect(pages['/other/papayas.markdown']).to.exist
    })

    they('include .html files', function () {
      expect(pages['/oranges.html']).to.exist
    })

    they('are loaded regardless of case', function () {
      expect(pages['/other/UPPERCASE.HTML']).to.exist
    })

    they('ingest HTML frontmatter', function () {
      expect(pages['/apples.md'].title).to.equal('Apples!')
      expect(pages['/apples.md'].keywords).to.deep.equal(['fruit', 'doctors'])
    })

    they('preserve original content in `input`', function () {
      expect(pages['/other/papayas.markdown'].input).to.be.a('string')
    })

    they('convert markdown to HTML', function () {
      var $ = pages['/other/papayas.markdown'].$
      expect($('a[href="https://digestion.com"]').text()).to.equal('digestion')
    })

    they('have a cheerio DOM object ($)', function () {
      var $ = pages['/other/papayas.markdown'].$
      expect($).to.exist
      expect($.text).to.be.a('function')
      expect($.html).to.be.a('function')
    })

    they('get a titlecased version of their filename as a default title, if not set', function (done) {
      var page = pages['/other/papayas.markdown']
      expect(page.title).to.equal('Papayas')

      // <title> tag is set after render
      page.render(context, function(err, output){
        var $ = cheerio.load(output)
        expect($('title').text()).to.equal('Papayas')
        done()
      })
    })

    describe('lobars handlebars helpers', function() {

      test('eq', function (done) {
        var page = pages['/other/papayas.markdown']

        expect(page.flavor).to.equal('delicious')
        expect(page.input).to.include('They are delicious')
        expect(page.input).to.include('They are NOT delicious')

        page.render(context, function(err, output){
          expect(output).to.include('They are delicious')
          expect(output).to.not.include('They are NOT delicious')
          done()
        })
      })

      test('lowerCase', function (done) {
        var page = pages['/other/papayas.markdown']

        expect(page.input).to.include('--Foo-Bar')
        expect(page.input).to.not.include('foo bar')

        page.render(context, function(err, output){
          expect(output).to.not.include('--Foo-Bar')
          expect(output).to.include('foo bar')
          done()
        })
      })

      test('endsWith', function (done) {
        var page = pages['/other/papayas.markdown']

        expect(page.input).to.include('abc does end with c')

        page.render(context, function(err, output){
          expect(output).to.include('abc does end with c')
          done()
        })
      })

    })

    describe('`src` attributes in the DOM', function() {
      var $input
      var $output

      before(function(done) {
        var page = pages['/other/index.md']
        $input = cheerio.load(page.input)
        page.render(context, function(err, output){
          $output = cheerio.load(output)
          done()
        })
      })

      it('converts relative', function(){
        expect($input('#guava-relative-link').attr('src')).to.equal('other/guava.png')
        expect($output('#guava-relative-link').attr('src')).to.equal('other/guava.png')

        expect($input('#banana-script').attr('src')).to.equal('other/banana.js')
        expect($output('#banana-script').attr('src')).to.equal('other/banana.js')
      })

      // it('ignores relative with leading slash', function(){
      //   expect(input).to.include('<img src="/guava-leading-slashy.png">')
      //   expect(output).to.include('<img src="/guava-leading-slashy.png">')
      // })
      //
      // it('ignores absolute', function(){
      //   expect(input).to.include('<img src="https://guava.com/logo.png">')
      //   expect(output).to.include('<img src="https://guava.com/logo.png">')
      // })
      //
      // it('ignores protocol-relative', function(){
      //   expect(input).to.include('<img src="//guava-relative.com/logo.png">')
      //   expect(output).to.include('<img src="//guava-relative.com/logo.png">')
      // })

    })

    describe('`href` attributes in the DOM', function() {
      var input
      var output

      before(function() {
        input = pages['/other/index.md'].input
        output = pages['/other/index.md'].$.html()
      })

      it('converts relative', function(){
        expect(input).to.include('<a href="other/papayas">papayas</a>')
        expect(output).to.include('<a href="other/papayas">papayas</a>')
      })

      it('ignores relative with leading slash', function(){
        expect(input).to.include('<a href="/grapes">grapes</a>')
        expect(output).to.include('<a href="/grapes">grapes</a>')
      })

      it('ignores absolute', function(){
        expect(input).to.include('<a href="http://mango.com">mango.com</a>')
        expect(output).to.include('<a href="http://mango.com">mango.com</a>')
      })

      it('ignores protocol-relative', function(){
        expect(input).to.include('<a href="//coconut-cdn.com">coconut-cdn.com</a>')
        expect(output).to.include('<a href="//coconut-cdn.com">coconut-cdn.com</a>')
      })
    })

    describe('title', function(){
      it('is derived from HTML frontmatter', function () {
        expect(pages['/apples.md'].title).to.equal('Apples!')
      })

      it('falls back to <title> tag, if present', function () {
        expect(pages['/oranges.html'].title).to.equal('We are Oranges')
      })

      it('falls back lastly to titlecased basename', function () {
        expect(pages['/other/papayas.markdown'].title).to.equal('Papayas')
      })

      it('injects <title> tag into HTML, if absent', function (done) {
        pages['/oranges.html'].render(context, function(err, output){
          expect(output).to.include('<title>We are Oranges</title>')
          done()
        })
      })
    })
  })

  describe('images', function(){
    var pages

    before(function(){
      pages = context.pages
    })

    it("are attached to pages in the same directory", function () {
      expect(pages['/thumbs/png/index.md'].images.thumb).to.exist
    })

    they('can be SVGs', function () {
      expect(pages['/thumbs/svg/index.md'].images.thumbnail).to.exist
    })

    they('can be JPGs', function () {
      expect(pages['/thumbs/jpg/index.html'].images.thumb).to.exist
    })

    they('can be GIFs', function () {
      expect(pages['/thumbs/gif/index.md'].images.thumb).to.exist
    })

    they('include width and height dimensions', function() {
      const jpg = pages['/thumbs/jpg/index.html'].images.thumb
      expect(jpg.dimensions.width).to.equal(170)
      expect(jpg.dimensions.height).to.equal(170)
    })

    they('include exif data', function(){
      const jpg = pages['/thumbs/jpg/index.html'].images.thumb
      expect(jpg.exif.imageSize.width).to.equal(170)
      expect(jpg.exif.imageSize.height).to.equal(170)
    })

    they('include color data as hex strings', function(){
      var colors = pages['/thumbs/gif/index.md'].images.thumb.colors
      expect(colors).to.be.an('array')
      expect(colors[0]).to.match(/^#[0-9a-f]{3,6}$/i)
    })
  })

  describe('layouts', function(){
    var layouts
    var pages


    before(function(){
      layouts = context.layouts
      pages = context.pages
    })

    they('have a type', function(){
      expect(layouts.default.type).to.equal('layout')
    })

    they('use /layout.html as the default layout, if present', function(done){
      var page = pages['/index.md']
      page.render(context, function(err, output) {
        var $ = cheerio.load(output)
        expect($('html').length).to.equal(1)
        expect($('#default-layout').text()).to.include('I am the fixtures index\n')
        done()
      })
    })

    they("can be specified in a page's HTML frontmatter", function(done){
      var page = pages['/custom.md']
      expect(page).to.exist
      expect(page.layout).to.equal('simple')

      page.render(context, function(err, output){
        var $ = cheerio.load(output)
        expect($('#simple-layout').length).to.equal(1)
        done()
      })
    })

    they('are not used if specified layout does not exist', function(done){
      var page = pages['/misguided.md']
      expect(page).to.exist
      page.render(context, function(err, output){
        var $ = cheerio.load(output)
        expect($('p').length).to.equal(1)
        expect($('body').length).to.equal(0)
        done()
      })
    })

    they('are not used if set to `false` in HTML frontmatter', function(done){
      var page = pages['/standalone.md']
      expect(page).to.exist
      page.render(context, function(err, output){
        var $ = cheerio.load(output)
        expect($('p').length).to.equal(1)
        expect($('#default-layout').length).to.equal(0)
        done()
      })
    })

  })

  describe('stylesheets', function(){
    var files

    before(function(){
      files = context.files
    })

    they('have a type', function(){
      expect(files['/styles.scss'].type).to.equal('stylesheet')
    })

    they('are processed with Myth if extension is .css', function(done){
      var stylesheet = files['/styles-myth.css']
      // console.log('stylesheet', stylesheet.input)
      expect(stylesheet.input).to.include('color: var(--green);')

      stylesheet.render(context, function(err, output){
        expect(output).to.include('color: #a6c776;')
        done()
      })
    })

    they('can be written in SCSS', function(done){
      var stylesheet = files['/styles.scss']
      expect(stylesheet.input).to.include('background: $color;')

      stylesheet.render(context, function(err, output){
        expect(output).to.include('background: green;')
        done()
      })
    })

    they('can be written in Less', function(done){
      var stylesheet = files['/styles-less.less']
      expect(stylesheet.input).to.include('color: @light-blue;')

      stylesheet.render(context, function(err, output){
        expect(output).to.include('color: #6c94be;')
        done()
      })
    })

    they('can be written in Sass', function(done){
      var stylesheet = files['/styles-sass.sass']
      expect(stylesheet.input).to.include('background: $color')

      stylesheet.render(context, function(err, output){
        expect(output).to.include('background: yellow;')
        done()
      })
    })

    describe('written in stylus', function() {
      var input
      var output

      before(function(done){
        input = files['/styles-stylus.styl'].input
        files['/styles-stylus.styl'].render(context, function(err, _output){
          output = _output
          done()
        })
      })

      they('can use variables', function(){
        expect(input).to.include('background color')
        expect(output).to.include('background: #f00;')
      })

      they('can require other stylus files in the same directory', function(){
        expect(input).to.include('border-color otherColor')
        expect(output).to.include('border-color: #00f;')
      })

      they('can require stylus files from different directories', function(){
        expect(input).to.include('font-size fontSize')
        expect(output).to.include('font-size: 1.5rem;')
      })
    })

  })

  describe('scripts', function(){
    var script
    var output

    before(function(done){
      script = context.files['/babel-and-browserify.js']
      script.render(context, function(err, _output){
        output = _output
        done()
      })
    })

    they('have a type', function(){
      expect(script.type).to.equal('script')
    })

    they('browserify', function(){
      expect(script.input).to.include("const url = require('url')")
      expect(output).to.include('Url.prototype.parse = function(')
    })

    they('babelify', function(){
      expect(script.input).to.include("`I am an ES2015 string`")
      expect(output).to.include("'I am an ES2015 string'")
    })
  })

  describe('data', function(){
    var page
    var output
    var data

    before(function(done){
      page = context.pages['/thumbs/index.html']
      data = page.data
      page.render(context, function(err, _output){
        output = _output
        done()
      })
    })

    it("attaches data from JSON files to files in the same directory", function () {
      expect(data.some_json_data.name).to.equal('cookie monster')
      expect(data.some_json_data.food).to.equal('cookies')
    })

    it("attaches data from YML files too", function () {
      expect(data.some_yml_data.name).to.equal('Bert')
      expect(data.some_yml_data.friend).to.equal('Ernie')
    })

    it('injects data into templates', function(){
      expect(output).to.contain('His name is cookie monster')
      expect(output).to.contain('Another character is Bert')
    })

    it('includes the `pages` object in the context', function(){
      expect(output).to.contain('<li class="page">/other</li>')
      expect(output).to.contain('<li class="page">/other/papayas</li>')
    })
  })

})
