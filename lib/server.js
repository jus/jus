#!/usr/bin/env node

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const path     = require('path')
const open     = require('open')
const inflect  = require('inflection').inflect
const jus      = require('./jus')
const log      = require('./log')
const env      = require('./env')

var server = module.exports = express()

server.use(cors())
server.port = Number(process.env.PORT) || 3000
if (!env.test) server.use(morgan(':method :url :response-time'))

server.start = (dir, cb) => {
  log(`Scanning ${path.basename(dir)}`)

  server.dir = dir
  require('./routes')(server)

  jus(server.dir)
    .on('started', (filenames) => {
      log(`Juicing ${filenames.length} ${inflect('file', filenames.length)}`)
    })
    .on('squeezed', (context) => {
      server.context = context
      if (server.started) return
      server.listen(server.port, function (err) {
        if (err) throw (err)
        server.started = true
        log('Running at http://localhost:' + server.port)
        if (!env.test && !env.production) open('http://localhost:3000')
        if (cb) return cb(null)
      })
    })
    .on('change', (filename) => {
      log(`${filename} updated`)
    })
}

// CLI
if (!module.parent && process.env.JUS_DIR) {
  server.start(process.env.JUS_DIR)
}
