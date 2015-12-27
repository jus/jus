const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function contextualize(files) {

  // Create named keys for each file in the array
  files.forEach(file => files[file.href] = file)

  // Start building a context object to pass to Handlebars templates
  var context = {files: files}

  // Add pages, stylesheets, scripts, images, datafiles, and layouts to the context.
  // They are already present in the `files` array, but this makes the data
  // easier to use within a handlebars template
  Object.keys(primitives).forEach(type => {
    const t = pluralize(type)
    context[t] = files.filter(file => file.type === type)

    // Use hrefs to create named keys for each item in the array
    context[t].forEach(file => context[t][file.href] = file)
  })

  // Create context.layouts.default, context,layouts.foo, etc
  context.layouts.forEach(layout => {
    context.layouts[layout.name] = layout
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
  })

  return context
}
