const express = require('express')
const stylus = require('stylus')
const cors = require('cors')
const path = require('path')
const get = require('lodash').get

var app = module.exports = express()

app.start = function(dir, pages) {
  app.dir = dir
  app.pages = pages
  app.use(stylus.middleware(dir))
  app.use(express.static(dir))
  app.use(cors())
  app.set('port', Number(process.env.PORT) || 3000)


  try {
    var redirects = require(path.resolve(app.dir, 'redirects.json'))
    console.log(`Found redirects.json`)
  } catch(e) {
    var redirects = {}
  }

  app.get('/api', function (req, res) {
    res.redirect('/api/pages')
  })

  app.get('/api/pages', function (req, res) {
    res.json(pages)
  })

  app.get('/api/pages/*', function (req, res) {
    var href = '/' + req.params[0]
    res.json(pages[href])
  })

  app.get('/*', function (req, res) {
    var href = req.path.replace(/\/$/, '')
    console.log(`GET ${href}`)
    var page = pages[href]
    var context = {page: page, pages: pages}

    if (href in redirects) return res.redirect(301, redirects[href])

    if (!page) return res.status(404).send(`Page not found ¯\_(ツ)_/¯`)

    if ('json' in req.query) {
      if (req.query.json.length) context = get(context, req.query.json)
      return res.json(context)
    } else {
      res.send(page.content.processed)
    }
  })

  app.listen(app.get('port'), function () {
    console.log('Listening on http://localhost:' + app.get('port'))
  })
}
