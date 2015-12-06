const express = require('express')
const stylus = require('stylus')
const hbs = require('express-handlebars')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const get = require('lodash').get

var app = module.exports = express()

app.start = function(pages) {
  app.dir = process.env.JUS_DIR
  app.pages = pages
  app.use(stylus.middleware(app.dir))
  app.use(express.static(app.dir))
  app.use(cors())
  app.set('port', Number(process.env.PORT) || 3000)
  app.use(morgan(':method :url :response-time'))

  app.engine('html', hbs({
    defaultLayout: 'main',
    extname: '.html'
  }))
  app.set('view engine', 'html')

  // Object.keys(pages).forEach(function(href){
  //   var page = pages[href]
  //   hbs.registerPartial('foo', 'barrrrrr')
  // })

  try {
    var redirects = require(path.resolve(app.dir, 'redirects.json'))
    console.log(`Found redirects.json`)
  } catch(e) {
    var redirects = {}
  }

  app.get('/api', function (req, res) {
    res.json(pages)
  })

  app.get('/api/*', function (req, res) {
    var href = req.params[0].replace(/^pages/, '')
    res.json(pages[href])
  })

  app.get('/', function (req, res) {
    console.log('wtf')
    // showPage('/', pages, req, res)
  })

  app.get('*', function (req, res) {
    var href = req.path.replace(/\/$/, '')
    showPage(href, pages, req, res)
  })

  app.listen(app.get('port'), function () {
    console.log('Listening on http://localhost:' + app.get('port'))
  })

  function showPage(href, pages, req, res){
    var page = pages[href]
    var context = {page: page, pages: pages}

    if (href in redirects) return res.redirect(301, redirects[href])

    if (!page) return res.status(404).send(`Page not found ¯\_(ツ)_/¯`)

    if ('json' in req.query) {
      if (req.query.json.length) context = get(context, req.query.json)
      return res.json(context)
    }

    if (page.template) {
      console.log('1: template')
      res.render(page.template, context)
    } else if (pages['/views/page']) {
      console.log('2: page')
      res.render('page', context)
    } else {
      console.log('3: string')
      res.send(page.content.processed)
    }

  }

}
