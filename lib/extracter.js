const attempt = require('lodash').attempt
const dateutil = require('dateutil')
const isError = require('lodash').isError
const yaml = require('js-yaml')
const pattern =
  new RegExp('^(?:\r\n?|\n)*<!--([^]*?)-->') // eslint-disable-line
const likeYamlPattern =
  new RegExp('(?:\r\n?|\n)*.*: *(?:#.*)?(?:\r\n?|\n)+ *- ')  // eslint-disable-line

const parse = module.exports = function parse (input) {
  if (!input.match(pattern)) return // no html comments on top of file found

  var obj

  var textToBeParsed = pattern.exec(input)[1]
  if (input.match(likeYamlPattern) &&  // found possible valid YAML syntax and
      !isError(attempt(yaml.safeLoad.bind(null, textToBeParsed)))) { // is valid
    obj = yaml.safeLoad(textToBeParsed)
//    if(obj == null) obj = true // hack to copy alternate parser behaivor
  } else {
    obj = {}
    textToBeParsed
      .replace(/(\r\n?|\n){2,}/g, '\n') // remove excess newlines
      .replace(/(\r\n?|\n) {2,}/g, ' ') // two-space indentation as a wrapped line
      .split('\n')
      .forEach(function (line) {
        if (line.match(/^\s?#/)) return // ignore lines starting with #
        var parts = line.split(/:(.+)?/) // split on _first_ colon
        if (parts.length < 2) return // key: value pair is required
        var key = (parts[0] || '').trim()
        var value = (parts[1] || '').trim()

        value = coerceValue(value)

        // if brackets then is an array of values that need to be parsed
        if (value[0] === '[' && value[value.length - 1] === ']') {
          value =
          value.substring(1, value.length - 1) // get rid off the brackets
            .trim()
            .split(/\s*,\s*/) // ignore irrelevant spaces and split on commas
            .map(function (val) {
              return coerceValue(val)
            })
        }

        obj[key] = value
      })
  }

  function coerceValue (value) {
    // boolean
    if (value === 'true') return true
    if (value === 'false') return false

    // date (within 200 years of today's date)
    var date = dateutil.parse(value)
    if (date.type !== 'unknown_date') {
      delete date.type
      delete date.size
      var now = new Date().getFullYear()
      var then = date.getFullYear()
      if (Math.abs(now - then) < 200) return date
    }

    // number
    var num = +value
    if (num) return num

    return value
  }

  return obj
}

parse.pattern = pattern
