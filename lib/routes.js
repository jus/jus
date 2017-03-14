const log      = require('./log')
const get      = require('lodash').get
const fs       = require('fs')
const path     = require('upath')
const identicon = require('identicon')

module.exports = function(server) {
  const filename = 'jus-server-404.html'
  const dir = path.relative(process.cwd(), __dirname)
  const error404fullpath = path.resolve(dir, 'fixtures', filename)
  // TODO: remove pre loading and asking for existence when proven stable
  var error404 = `404 ¯\_(ツ)_/¯ 404\n\nhref: _href-placeholder_ `
  if (fs.existsSync(error404fullpath)) {
    error404 = fs.readFileSync(error404fullpath, 'utf8')
  }

  server.redirects = require('./redirects')(server)

  server.get('/favicon.ico', (req, res, next) => {
    let faviconPath = path.join(server.sourceDir, 'favicon.ico')
    // Serve the real file if it exists
    fs.access(faviconPath, (err) => {
      if (!err) return res.sendFile(faviconPath)
      // Otherwise generate a cool icon, unique per sourceDir
      identicon.generate({id: server.sourceDir, size: 16}, (err, buffer) => {
        if (err) return res.sendStatus(500)
        res.type('image/x-icon')
        return res.send(buffer)
      })
    })
  })

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

    if (!file)
      return res.status(404).send(error404.replace('_href-placeholder_', href))

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
