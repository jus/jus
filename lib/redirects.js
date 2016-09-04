const path     = require('upath')
const log      = require('./log')

module.exports = function(server) {
  try {
    return require(path.resolve(server.sourceDir, 'redirects.json'))
  } catch(e) {
    return {}
  }
}
