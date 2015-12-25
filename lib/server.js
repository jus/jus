#!/usr/bin/env node

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const path     = require('path')
const jus      = require('./jus')
const log      = require('./log')

var server = module.exports = express()

server.use(cors())
server.set('port', Number(process.env.PORT) || 3000)
if (process.env.NODE_ENV != 'test') {
  server.use(morgan(':method :url :response-time'))
}

server.start = (dir, cb) => {
  log(`Juicing ${path.basename(dir)}`)

  server.dir = dir
  require('./routes')(server)

  jus(server.dir)
    .on('file', (file) => {
      log(`${file.path.relative} found`)
    })
    .on('squeezed', (files, context) => {
      server.files = files
      server.context = context
      if (server.started) return

      server.listen(server.get('port'), function (err) {
        if (err) throw (err)
        server.started = true
        log('Listening on http://localhost:' + server.get('port'))
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
