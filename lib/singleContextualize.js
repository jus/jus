const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function singleContextualize(context, file) {

  // Create named key for easy access
  context.files[file.keyName] = file
  /*
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
  */
  // Add file to list of files of its type
  // ex. type stylesheet is added to stylesheets list
  Object.assign(context[pluralize(file.type)].files, file)
/*
  // Create context.layouts.default, context,layouts.foo, etc
  context.layouts.forEach(layout => {
    context.layouts[layout.name] = layout
  })
*/
  // Create named key for easy access in layouts list if its a member
  if (file.type === 'layout') context.layouts[file.name] = file
/*
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
*/
  if (file.type === 'page') {
    // Attach image metadata to 'page' in the same directory
    file.images = {}
    context.images
    context.images.forEach(image => {
      if (image.path.dir === file.path.dir) {
        file.images[image.path.name] = image
      }
    })
    // Attach JSON and YML data to 'page' in the same directory
    file.data = {}
    context.datafiles.forEach(datafile => {
      if (datafile.path.dir === file.path.dir) {
        file.data[datafile.path.name] = datafile.data
      }
    })
  }

  return context
}
