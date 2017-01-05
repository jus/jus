const frontmatter     = require('html-frontmatter')
const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function contextualize(files) {

  // Create named keys for each item in the array, for easy access
  files.forEach(file => files[file.keyName] = file)

  // Start building a context object to pass to Handlebars templates
  var context = {files: files}

  // Add pages, stylesheets, scripts, images, datafiles, and layouts to the context.
  // They are already present in the `files` array, but this makes the data
  // easier to use within a handlebars template
  Object.keys(primitives).forEach(type => {
    const t = pluralize(type)
    context[t] = files.filter(file => file.type === type)

    // Create named keys for each item in the array, for easy access
    // context.pages['/index.md']
    // context.stylesheets['/styles/foo.sass']
    // context.datafiles.baz_wibble
    context[t].forEach(file => context[t][file.keyName] = file)
  })

  // Create context.layouts.default, context.layouts.foo, etc
  context.layouts.forEach(layout => {
    context.layouts[layout.name] = layout
  })

  // Create context.partials.foo, etc
  context.partials.forEach(partial => {
    context.partials[partial.name] = partial
  })

  context.pages.forEach(page => {

    // Attach image metadata to pages in the same directory
    page.images = {}
    context.images.forEach(image => {
      if (image.path.dir === page.path.dir) {
        page.images[image.path.name] = image
      }
    })

    // Attach JSON and YML data to pages in the same directory
    page.data = {}
    context.datafiles.forEach(datafile => {
      if (datafile.path.dir === page.path.dir) {
        page.data[datafile.path.name] = datafile.data
      }
    })

    // Extract data from pages themselves
    const data = frontmatter(page.input)
    // Attach data twice at to different levels
    Object.assign(page, data) // used to mantain jus versions compatability
    Object.assign(page.data, data) // used for JSON rendering in routing

  })

  return context
}
