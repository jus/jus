#!/usr/bin/env node

const path            = require('path')
const tmp             = require('tmp')
const open            = require('open')
const server          = require('../lib/server')
const compiler        = require('../lib/compiler')
const args            = require('minimist')(process.argv.slice(2))
const command         = args._[0]

if (!command) usage()

if (args._[1]) const sourceDir = path.resolve(process.cwd(), args._[1])
if (args._[2]) const targetDir = path.resolve(process.cwd(), args._[2])
process.env.JUS_PORT = args.port || args.p || 3000

switch(command) {
  case 'sers':
  case 'serve':
  case 'server':
  case 'servez':
  case 'servons':
    server.start(sourceDir, targetDir)
    break
  case 'compile':
  case 'build':
  case 'squeeze':
    compiler.start(sourceDir, targetDir)
    break
  case 'help':
  case 'docs':
    open('http://jus.js.org')
    break
  default:
    console.log(`Unrecognized command: ${command}\n`)
    usage()
}

function usage() {
  console.log(
`Usage:

  jus serve                               Start server in the current directory
  jus serve <sourceDir>                   Start server is a specific directory
  jus serve <sourceDir> --port 1337       Start server with a custom port. Default is 3000
  jus compile <sourceDir> <targetDir>     Compile project to static assets (HTML, JS and CSS)
  jus help                                Open jus.js.org in your browser
`)
  process.exit(1)
}
