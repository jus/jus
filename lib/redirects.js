const path     = require('path')
const log      = require('./log')

module.exports = function(server) {
  try {
    log(`Found redirects.json`)
    return require(path.resolve(server.dir, 'redirects.json'))
  } catch(e) {
    return {}
  }
}
