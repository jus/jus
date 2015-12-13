const handlebars      = require('handlebars')
const render          = handlebars.compile
const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function associate(files) {

  // Create named keys for each file in the array
  files.forEach(file => files[file.href] = file)

  // Start building a context object to pass to Handlebars templates
  var context = {files: files}

  // Add pages, stylesheets, scripts, images, datafiles, and layouts to the context.
  // They are already present in the `files` array, but this makes the data
  // easier to use within a handlebars template
  Object.keys(primitives).forEach(type => {
    context[pluralize(type)] = files.filter(file => file.type === type)
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

    // Render page using handlebars, passing in a god object as context
    var thisPagesContext = Object.assign({}, context, {page: page})

    page.content.processed = render(page.content.processed)(thisPagesContext)

    var layout
    if (page.layout) {
      // Use layout specified in frontmatter
      layout = context.layouts[page.layout]
    } else if (context.layouts.default && page.layout !== false) {
      // Use default layout (unless set to `false` in frontmatter)
      layout = context.layouts.default
    }

    if (layout) {
      page.content.processed = render(layout.content.original)({body: page.content.processed})
    }

  })
}
