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

if (env.production) server.use(morgan('combined'))
if (!env.production && !env.test) server.use(morgan('dev'))

server.start = (sourceDir, cb) => {
  if (!sourceDir) sourceDir = process.cwd()

  server.port = Number(process.env.JUS_PORT) || 3000
  server.sourceDir = sourceDir

  const bs = require('browser-sync')({
    port: 3030,
    files: path.join(sourceDir, '/**/*'),
    logSnippet: false
  })
  server.use(require('connect-browser-sync')(bs))

  require('./routes')(server)

  jus(server.sourceDir)
    .on('started', () => {
      log(`Juicing ${path.basename(server.sourceDir)}...`)
    })
    .on('squeezing', (files) => {
      log(`Squeezing ${files.length} ${inflect('file', files.length)}...`)
    })
    .on('squeezed', (context) => {
      server.context = context
      if (server.started) return
      server.listen(server.port, function (err) {
        if (err) throw (err)
        server.started = true
        server.url = `http://localhost:${server.port}`
        log(`Et Voila!\nThe server is running at ${server.url}\n`)
        if (!env.test && !env.production) open(server.url)
        if (cb) return cb(null)
      })
    })
    .on('file-add',    (file) => log(`  ${file.path.relative} added`, 'dim') )
    .on('file-update', (file) => log(`  ${file.path.relative} updated`, 'dim') )
    .on('file-delete', (file) => log(`  ${file.path.relative} deleted`, 'dim') )
}
