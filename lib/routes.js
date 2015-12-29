const log      = require('./log')
const get      = require('lodash').get

module.exports = function(server) {

  server.redirects = require('./redirects')(server)

  server.get('/api', (req, res) => {
    res.json(server.context)
  })

  server.get('/api/*', (req, res) => {
    var href = req.params[0].replace(/^files/, '')
    var response = Object.assign({page: server.context.files[href]}, server.context)

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

  server.respondWithFile = (href, req, res) => {
    if (href in server.redirects)
      return res.redirect(301, server.redirects[href])

    var context = server.context
    var file = context.files[href]

    if (!file)
      return res.status(404).send(`404 ¯\_(ツ)_/¯ 404\n\nhref: ${href}`)

    if ('json' in req.query)
      return res.json(req.query.json.length ? get(context, req.query.json) : context)

    res.contentType(file.path.target.ext)
    return res.send(file.render(context))
  }

}
