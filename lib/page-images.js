const path = require('path')
const patterns = require('./patterns')

module.exports = function (images, pages) {
  Object.keys(pages).forEach(function (href) {
    var page = pages[href]
    page.images = {}
    Object.keys(images).forEach(function (imageHref) {
      var image = images[imageHref]
      if (path.dirname(image.fullPath) == path.dirname(page.fullPath)) {
        var nickname = path.basename(image.href).replace(patterns.image, '')
        page.images[nickname] = image
      }
    })
  })
}
