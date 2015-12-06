#!/usr/bin/env node

const jus = require('./jus')
const app = require('./app')

var server = module.exports = function server () {
  jus(process.env.JUS_DIR, function(err, pages){
    if (err) throw err
    app.start(pages)
  })
}

if (!process.parent) server()
