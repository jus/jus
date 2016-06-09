#!/usr/bin/env node

const path            = require('path')
const tmp             = require('tmp')
const open            = require('open')
const chalk           = require('chalk')
const pkg             = require('./package.json')
const server          = require('./lib/server')
const compiler        = require('./lib/compiler')
const args            = require('minimist')(process.argv.slice(2))
const command         = args._[0]

if (args.v || args.version) version()
if (!command) usage()

if (args._[1]) var sourceDir = path.resolve(process.cwd(), args._[1])
if (args._[2]) var targetDir = path.resolve(process.cwd(), args._[2])
process.env.JUS_PORT = args.port || args.p || 3000
process.env.JUS_BASEDIR = args.basedir || args.b || '/'

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
`
  jus serve                         Serve the current directory
  jus serve <source>                Serve a specific directory
  jus serve <source> --port 1337    Use a custom port. Default is 3000
  jus compile <source> <target>     Compile source files to static assets
  jus help                          Open jus.js.org in your browser
`)

  console.log(chalk.dim(`  version ${pkg.version}`))
  process.exit()
}

function version() {
  console.log(pkg.version)
  process.exit()
}
