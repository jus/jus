const handlebars = require('handlebars')
const render = handlebars.compile

// Associate pages and JSON files that live in the same directory
module.exports = function associate(files) {
  var pages = files.filter(file => file.kind === 'page')
  var images = files.filter(file => file.kind === 'image')
  var datafiles = files.filter(file => file.kind === 'datafile')

  // Create keys for each file so we can do `files['/some/page']`
  files.forEach(file => files[file.href] = file)

  pages.forEach(function (page) {
    // Attach EXIF, color, and dimensions data from neighboring image files
    page.images = {}
    images.forEach(function (image) {
      if (image.path.dir === page.path.dir) {
        page.images[image.title] = image
      }
    })

    // Attach data from neighboring JSON files
    page.data = {}
    datafiles.forEach(function (datafile) {
      if (datafile.path.dir === page.path.dir) {
        page.data[datafile.title] = datafile.data
      }
    })

    // Data to pass to the handlebars template
    const context = {
      page: page,
      pages: pages,
      files: files
    }

    page.content.processed = render(page.content.processed)(context)
  })
}
