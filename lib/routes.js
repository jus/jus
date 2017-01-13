const log      = require('./log')
const get      = require('lodash').get
const has      = require('lodash').has
const find     = require('lodash').find
const filter     = require('lodash').filter

module.exports = function(server) {
  server.redirects = require('./redirects')(server)

  server.get(encodeURI('/jus>api'), (req, res) => {
    res.json(server.context)
  })

  server.get(encodeURI('/jus>api>*'), (req, res) => {
    var response = server.deepFind(server.context, req.params[0])
    if (req.query.key) response = get(response, req.query.key)
    res.json(response)
  })

  server.get('/', (req, res) => {
    var href = '/'
    server.respondWithFile(href, req, res)
  })

  server.get('*', (req, res) => {
    var href = req.path.replace(/\/$/, '') // remove trailing slash
    server.respondWithFile(href, req, res)
  })

  server.respondWithFile = (href, req, res) => {
    if (href in server.redirects)
      return res.redirect(301, server.redirects[href])

    var context = server.context
    var file = context.files.find(file =>
       file.href === href || file.path.relative == href) // with or without ext

    if (!file) {
      // Maybe not found because request html/md/etc page but with JSON rendering
      var lowerCaseHref = href.toLowerCase()
      if (lowerCaseHref.endsWith('.json')) {
        var extensionPoint = lowerCaseHref.lastIndexOf('.json')
        var requestNoExt = href.slice(0, extensionPoint)
        file = context.files.find(file => {

// TODO: Review the use of file.href without the ext === requestNoExt

          return file.href === requestNoExt
        })
        if (file)
          return res.json(file.data)
      }
      file = context.files.find(
        // fixed name choosen to avoid 404 routing namespace conflict
        file =>
          file.href === '/hard-to-guess-404-filename'
      )
      if (file)
        return res.status(404).sendFile(file.path.full)
      else
        // This never happens. We added the file before starting the server
        return res.status(404).send(`404 ¯\_(ツ)_/¯ 404\n\nhref: ${href}`)
    }
    if ('json' in req.query)
      return res.json(req.query.json.length ? get(file, req.query.json) : file)

    if(file.isSqueezable) { // Interpreat as: Does file have its own render() ?
      res.contentType(file.path.target.ext)
      return file.render(context, function(err, output){
        if (err) {
          return res
            .status(500)
            .send('Error rendering: <br>' + file.keyName +'<br>'+ err)}
        return res.send(output)
      })
    } else {
      return res.sendFile(file.path.full)
    }
  } // End of functiion server.respondWithFile()

  // Funtion to obtain deep nested properties of an object
  // obj : object to be transversed
  // path: string with look up keys separated by delimiter in nested order
  // has a default look up key for array properties
  //
  //  Sample URLs:
  //      '/jus>api>files>/prunes'
  //      '/jus>api>pages/prunes'
  //      '/jus>api>stylesheets>/assets/css/template.css'
  //       'jus>api>datafiles>/package.json>data>version'
  //
  //  Example:
  //     files = [
  //         { href: '/apples',  title: 'Apples!' },
  //         { href: '/oranges', title: 'Orenges!' },
  //         { href: '/prunes',  title: 'Prunes!' }
  //     ]
  //
  //     deepFind(oPage, 'files>/prunes')
  //     > { href: '/prunes',  title: 'Prunes!' }
  //     deepFind(oPage, 'files>0>title')
  //     > 'Apples!'
  //     deepFind(oPage, 'files>1>href')
  //     > '/oranges'
  //     deepFind(oPage, 'files>href=/oranges')
  //     > { href: '/oranges', title: 'Orenges!' }
  //
  server.deepFind = function (obj, path) {
    const delimiter = '>'
    const defaultKey = 'href'

    var keys = path.split(delimiter)
    var current = obj
    var index
    var subKeys
    var candidates
    var selected
    keys.forEach(key => {
      if(typeof(key) !== "string") return current = {}
      if(key.length < 1) return current = {}
      if(Object.prototype.toString.call(current) === '[object Array]') {
        if (key.indexOf('=') > 0) {
          subKeys = key.split('=')
          current = find(current, o => {
            return o[subKeys[0]] === subKeys[1]
          }) || {}
        } else {
          selected = undefined
          candidates = filter(current, o => {
            return has(o, defaultKey)
          })
          if (candidates.length > 0) {
            selected = find(candidates, o => {
              return o[defaultKey] === key
            })
          }
          if (selected) {
            current = selected
          } else {
            if (isNaN(parseInt(key))) return current = {}
            index = Math.abs(parseInt(key))
            if (current.length <= index) return current = {}
            current = current[index]
          }
        }
      } else {
        if(!has(current, key)) return current = {}
        current = current[key]
      }
    })
    return current
  } // end of function deepFind()

}
