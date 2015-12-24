const log      = require('./log')
const get      = require('lodash').get

module.exports = function(server) {
  server.get('/api', (req, res) => {
    res.json(server.context)
  })

  server.get('/api/*', (req, res) => {
    var href = req.params[0].replace(/^files/, '')
    var response = Object.assign({page: server.files[href]}, server.context)

    if (req.query.key) response = get(response, req.query.key)

    res.json(response)
  })

  server.get('/', (req, res) => {
    var href = '/'
    server.respondWithFile(href, req, res)
  })

  server.get('*', (req, res) => {
    var href = req.path.replace(/\/$/, '') // remove trailing slash
    server.respondWithFile(href, req, res)
  })

  server.respondWithFile = function respondWithFile (href, req, res) {
    if (href in server.redirects)
      return res.redirect(301, server.redirects[href])

    const file = server.files[href]

    if (!file)
      return res.status(404).send(`404 ¯\_(ツ)_/¯ 404`)

    if ('json' in req.query)
      return res.json(req.query.json.length ? get(file, req.query.json) : file)

    return res.send(file.output)
  }

}
