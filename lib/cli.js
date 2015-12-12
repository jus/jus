#!/usr/bin/env node

const path            = require('path')
const nodemon         = require('nodemon')
const args            = require('minimist')(process.argv.slice(2))
const command         = args._[0]

if (!command) usage()

process.env.JUS_DIR = args._[1] || process.cwd()
process.env.JUS_PORT = args.port || args.p || 3000

switch(command) {
  case 'serve':
  case 'server':
    nodemon({
      script: path.resolve(__dirname, 'server.js'),
      ext: 'html hbs handlebars md markdown js jsx es es6 css sass scss styl png gif jpg svg',
      env: process.env
    })

    nodemon
      .on('restart', function (files) {
        console.log(path.relative(process.cwd(), files[0]) + ' updated')
        console.log('Restarting...\n')
      })
      // .once('exit', function () {
      //   console.log('\nAu revoir!')
      //   process.exit()
      // })
    break
  default:
    console.log(`Unrecognized command: ${command}\n`)
    usage()
}

function usage() {
  console.log(
`Usage:

jus serve
jus serve <path>
jus serve <path> --port 1337

If 'path' is omitted, the current directory is served.
If 'port' is omitted, 3000 is used.
`)
  process.exit(1)
}
