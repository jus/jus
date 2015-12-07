#!/usr/bin/env node

const jus = require('./jus')
const app = require('./app')

var server = module.exports = function server () {
  jus(process.env.JUS_DIR, function(err, files){
    if (err) throw err
    app.start(files)
  })
}

if (!process.parent) server()
