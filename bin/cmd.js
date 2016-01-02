#!/usr/bin/env node

const path            = require('path')
const tmp             = require('tmp')
const server          = require('../lib/server')
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
  default:
    console.log(`Unrecognized command: ${command}\n`)
    usage()
}

function usage() {
  console.log(
`Usage:

jus serve
jus serve <sourceDir>
jus serve <sourceDir> --port 1337

default sourceDir: .
default port: 3000
`)
  process.exit(1)
}
