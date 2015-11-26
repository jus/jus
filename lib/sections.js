const titlecase = require('titlecase').toLaxTitleCase

module.exports = function deriveSections(pages) {
  var sections = {}

  Object.keys(pages).sort().forEach(function(href){
    var page = pages[href]

    // Pages in top-level directory don't have a section
    if(!page.section) return

    // Create section if it doesn't already exist
    if (!sections[page.section]) {
      sections[page.section] = {
        title: titlecase(page.section),
        pages: {}
      }
    }

    // Add page to section
    sections[page.section].pages[page.href] = page
  })

  return sections
}
