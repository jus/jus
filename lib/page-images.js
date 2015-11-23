module.exports = function (images, pages) {
  Object.keys(pages).forEach(function (href) {
    var page = pages[href]
    page.images = {}
    Object.keys(images).forEach(function (imageHref) {
      var image = images[imageHref]
      if (image.relativeDirName == page.relativeDirName) {
        page.images[image.title] = image
      }
    })
  })
}
