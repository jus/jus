const handlebars = require('handlebars')
const get = require('lodash').get
const patterns = require('./patterns')

// If page has `data` and looks like a handlebars template, inject data into it

module.exports = function (pages) {
  Object.keys(pages).forEach(function (href) {
    var page = pages[href]
    var content = String(get(page, 'content.processed'))
    if (page.data && content.match(patterns.handlebarsy)) {
      page.content.processed = handlebars.compile(content)(page.data);
    }
  })
}
