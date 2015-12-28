const env = require('./env')

module.exports = env.test ? function(){} : console.log
