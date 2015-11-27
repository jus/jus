const handlebars = require('handlebars')

// Associate pages and JSON files that live in the same directory
module.exports = function (dataFiles, pages) {
  Object.keys(pages).forEach(function (href) {
    var page = pages[href]
    page.data = {}

    // Find data files in the same directory, and attach
    // them to this page's `data` object
    Object.keys(dataFiles).forEach(function (dataHref) {
      var dataFile = dataFiles[dataHref]
      if (dataFile.relativeDirName == page.relativeDirName) {
        page.data[dataFile.name] = dataFile.data
      }
    })

    // Inject data into template
    page.content.processed = handlebars.compile(page.content.processed)(page.data);
  })
}
