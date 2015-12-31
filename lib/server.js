#!/usr/bin/env node

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
const path     = require('path')
const open     = require('open')
const inflect  = require('inflection').inflect
const env      = require('lil-env-thing')
const jus      = require('./jus')
const log      = require('./log')

var server = module.exports = express()
server.use(cors())
server.port = Number(process.env.PORT) || 3000

if (env.production) server.use(morgan('combined'))
if (!env.production && !env.test) server.use(morgan('dev'))

server.start = (dir, cb) => {
  server.dir = dir
  require('./routes')(server)

  jus(server.dir)
    .on('started', () => {
      log(`Juicing ${path.basename(dir)}...`)
    })
    .on('squeezed', (context) => {
      server.context = context
      if (server.started) return
      server.listen(server.port, function (err) {
        if (err) throw (err)
        server.started = true
        log(`Et Voila! The server is running at http://localhost:${server.port}\n`)
        if (!env.test && !env.production) open('http://localhost:3000')
        if (cb) return cb(null)
      })
    })
    .on('file-add', (file) => log(`  ${file.path.relative}`, 'dim') )
    .on('file-update', (file) => log(`  ${file.path.relative} updated`, 'dim') )
    .on('file-delete', (file) => log(`  ${file.path.relative} deleted`, 'dim') )
}

// CLI
if (!module.parent && process.env.JUS_DIR) {
  server.start(process.env.JUS_DIR)
}
