#!/usr/bin/env node

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const get      = require('lodash').get
const path     = require('path')
const jus      = require('./jus')

var app = module.exports = express()

app.start = function(files) {
  app.dir = process.env.JUS_DIR
  app.files = files
  app.use(express.static(app.dir))
  app.use(cors())
  app.set('port', Number(process.env.PORT) || 3000)
  app.use(morgan(':method :url :response-time'))

  try {
    var redirects = require(path.resolve(app.dir, 'redirects.json'))
    console.log(`Found redirects.json`)
  } catch(e) {
    var redirects = {}
  }

  app.get('/api', function (req, res) {
    res.json(files)
  })

  app.get('/api/*', function (req, res) {
    var href = req.params[0].replace(/^files/, '')
    res.json(files[href])
  })

  app.get('/', function (req, res) {
    app.showFile('/', files, req, res)
  })

  app.get('*', function (req, res) {
    var href = req.path.replace(/\/$/, '') // remove trailing slash
    app.showFile(href, files, req, res)
  })

  app.listen(app.get('port'), function () {
    console.log('Listening on http://localhost:' + app.get('port'))
  })

}

app.showFile = function showFile(href, files, req, res) {
  if (href in redirects) return res.redirect(301, redirects[href])

  const file = files[href]

  if (!file) {
    return res.status(404).send(`404 ¯\_(ツ)_/¯ 404`)
  } else if ('json' in req.query) {
    return res.json(req.query.json.length ? get(file, req.query.json) : file)
  } else {
    res.send(page.content.processed)
  }
}

app.jus = function () {
  console.log('process.env.JUS_DIR', process.env.JUS_DIR)
  jus(process.env.JUS_DIR, function(err, files){
    if (err) throw err
    app.start(files)
  })
}

if (!process.parent) {
  app.jus()
}
