const env = require('lil-env-thing')
const chalk = require('chalk')

module.exports = function(message, style) {
  if (env.test) return

  style = style || 'reset'

  console.log(chalk[style](message))
}
