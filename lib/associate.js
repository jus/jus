const render = require('handlebars').compile

// Associate pages and JSON files that live in the same directory
module.exports = function associate(pages, images, dataFiles) {

  Object.keys(pages).forEach(function (href) {
    var page = pages[href]

    // Attach EXIF, color, and dimensions data from neighboring image files
    page.images = {}
    Object.keys(images).forEach(function (imageHref) {
      var image = images[imageHref]
      if (image.parent == page.parent) {
        page.images[image.title] = image
      }
    })

    // Attach data from neighboring JSON files
    page.data = {}
    Object.keys(dataFiles).forEach(function (dataHref) {
      var dataFile = dataFiles[dataHref]
      if (dataFile.parent == page.parent) {
        page.data[dataFile.name] = dataFile.data
      }
    })

    page.content.processed = render(page.content.processed)(page)
  })
}
