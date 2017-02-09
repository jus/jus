const log      = require('./log')
const get      = require('lodash').get

module.exports = function(server) {

  server.redirects = require('./redirects')(server)

  server.get('/api', (req, res) => {
    res.json(server.context)
  })

  server.get('/api/*', (req, res) => {
    var href = req.params[0].replace(/^files/, '')
    var page = server.context.pages.find(page => page.href === href)
    var response = Object.assign({page: page}, server.context)

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
    var file = context.files.find(file => file.href === href)

    if (!file) {
      // Maybe not found because requesting page with JSON rendering
      var lowerCaseHref = href.toLowerCase()
      if (lowerCaseHref.endsWith('.json')) {
        var extensionPoint = lowerCaseHref.lastIndexOf('.json')
        var requestNoExt = href.slice(0, extensionPoint)
        file = context.files.find(file => {
          return file.href === requestNoExt
        })
        if (file)
          return res.json(file.data)
      }

      file = context.files.find(
        // name choosen to avoid 404 routing namespace conflict
        // (ex.: conflict with 404.html)
        file =>
          file.href === '/hard-to-guess-404-filename-seen-only-in-development'
      )
      if (file)
        return res.status(404).sendFile(file.path.full)
      else
        // This never happens. We added the file before starting the server
        return res.status(404).send(`404 ¯\_(ツ)_/¯ 404\n\nhref: ${href}`)

    }

    if ('json' in req.query)
      return res.json(req.query.json.length ? get(file, req.query.json) : file)

    if(file.isSqueezable) {
      res.contentType(file.path.target.ext)
      return file.render(context, function(err, output){
        return res.send(output)
      })
    } else {
      return res.sendFile(file.path.full)
    }
  }

}
