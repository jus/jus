const handlebars      = require('handlebars')
const render          = handlebars.compile
const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function associate(files) {

  // Create a named key for each file
  // `files` remains an array, but with convenient object-style reference
  // e.g. `files['/some/page']`
  files.forEach(file => files[file.href] = file)

  // Build a big context object to pass to handlebars templates
  var context = {files: files}

  // Add pages, stylesheets, scripts, images, and datafiles to the context.
  // They are already present in the `files` array, but this makes the data
  // easier to use within a handlebars template
  Object.keys(primitives).forEach(kind => {
    context[pluralize(kind)] = files.filter(file => file.kind === kind)
  })

  context.pages.forEach(function (page) {

    // Attach image metadata to pages in the same directory
    page.images = {}
    context.images.forEach(function (image) {
      if (image.path.dir === page.path.dir) {
        page.images[image.title] = image
      }
    })

    // Attach JSON and YML data to pages in the same directory
    page.data = {}
    context.datafiles.forEach(function (datafile) {
      if (datafile.path.dir === page.path.dir) {
        page.data[datafile.title] = datafile.data
      }
    })

    var thisPagesContext = Object.assign({}, context, {page: page})

    page.content.processed = render(page.content.processed)(thisPagesContext)
  })
}
