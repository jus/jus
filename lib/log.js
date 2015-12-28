const env = require('lil-env-thing')

module.exports = env.test ? function(){} : console.log
