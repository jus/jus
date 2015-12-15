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
  log(`Juicing ${path.basename(dir)}`)
  server.dir = dir
  server.use(express.static(server.dir))
  server.use(cors())
  server.set('port', Number(process.env.PORT) || 3000)
  if (process.env.NODE_ENV != 'test') server.use(morgan(':method :url :response-time'))

  try {
    server.redirects = require(path.resolve(server.dir, 'redirects.json'))
    log(`Found redirects.json`)
  } catch(e) {
    server.redirects = {}
  }

  server.get('/api', function (req, res) {
    res.json(server.context)
  })

  server.get('/api/*', function (req, res) {
    var href = req.params[0].replace(/^files/, '')
    res.json(Object.assign({page: server.files[href]}, server.context))
  })
  //
  // server.get('/', function (req, res) {
  //   server.respondWithFile('/', files, req, res)
  // })
  //
  server.get('*', function (req, res) {
    var href = req.path.replace(/\/$/, '') // remove trailing slash
    server.respondWithFile(href, req, res)
  })

  // Juice all the files, then start the server
  jus(server.dir, function(err, files, context){
    if (err) return cb(err)
    server.files = files
    server.context = context
    server.listen(server.get('port'), function (err) {
      if (err) return cb(err)
      log('Listening on http://localhost:' + server.get('port'))
      if (cb) return cb(null)
    })
  })
}

server.respondWithFile = function respondWithFile(href, req, res) {
  if (href in server.redirects)
    return res.redirect(301, server.redirects[href])

  const file = server.files[href]

  if (!file)
    return res.status(404).send(`404 ¯\_(ツ)_/¯ 404`)

  if ('json' in req.query)
    return res.json(req.query.json.length ? get(file, req.query.json) : file)

  return res.send(file.output)
}

// CLI
if (!module.parent && process.env.JUS_DIR) {
  server.start(process.env.JUS_DIR)
}
