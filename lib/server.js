const path = require('path')
const jus = require('./jus')
const app = require('./app')

module.exports = function server (dir) {

  // Allow user to type `jus serve` to default to current working directory
  if (!dir) dir = process.cwd()

  jus(dir, function(err, pages){
    if (err) throw err
    app.start(dir, pages)
  })
}
