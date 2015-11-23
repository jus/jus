// Associate pages and JSON files that live in the same directory
module.exports = function (data, pages) {
  Object.keys(pages).forEach(function (href) {
    var page = pages[href]
    page.data = {}
    Object.keys(data).forEach(function (dataHref) {
      var datum = data[dataHref]
      if (datum.relativeDirName == page.relativeDirName) {
        page.data[datum.name] = datum.data
      }
    })
  })
}
