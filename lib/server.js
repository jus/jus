#!/usr/bin/env node

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const get      = require('lodash').get
const path     = require('path')
const jus      = require('./jus')
const log      = require('./log')

var server = module.exports = express()

server.start = function(dir, cb) {
  server.dir = dir
  server.use(express.static(server.dir))
  server.use(cors())
  server.set('port', Number(process.env.PORT) || 3000)
  if (process.env.NODE_ENV != 'test') server.use(morgan(':method :url :response-time'))

  try {
    var redirects = require(path.resolve(server.dir, 'redirects.json'))
    log(`Found redirects.json`)
  } catch(e) {
    var redirects = {}
  }

  server.get('/api', function (req, res) {
    res.json(server.files)
  })

  server.get('/api/*', function (req, res) {
    var href = req.params[0].replace(/^files/, '')
    res.json(server.files[href])
  })
  //
  // server.get('/', function (req, res) {
  //   server.showFile('/', files, req, res)
  // })
  //
  // server.get('*', function (req, res) {
  //   var href = req.path.replace(/\/$/, '') // remove trailing slash
  //   server.showFile(href, files, req, res)
  // })

  jus(server.dir, function(err, files){
    if (err) return cb(err)
    server.files = files
    server.listen(server.get('port'), function (err) {
      if (err) return cb(err)
      log('Listening on http://localhost:' + server.get('port'))
      return cb(null)
    })
  })


}

server.showFile = function showFile(href, files, req, res) {
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

server.jus = jus
