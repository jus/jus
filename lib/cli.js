#!/usr/bin/env node

const args = require('minimist')(process.argv.slice(2))
const command = args._[0]

if (!command) usage()

// assign value of --port to process.env.PORT, etc
Object.keys(args).forEach(function(key){
  process.env[key.toUpperCase()] = args[key]
})

switch(command) {
  case 'serve':
  case 'server':
    var dir = args._[1]
    require('./server')(dir)
    break;
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
