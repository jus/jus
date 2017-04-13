# Plugins API
A plugin is a module that exports an object with functions to process a particular file type
- `check()` - Function that calls back with a result indicating whether this plugin should process the given file
- `parse()` - Function that interprets/extracts file data
- `render()` - Function externally called by `express` server to answer a file `GET` HTTP request
- ... and some support data like `filetype` , `name` and `priority`

---

### check()

- Example from `ctx-datafile.js`

```
  . . .
  // calls back with a result indicating whether this class should process the given file.
  check: (filename, callback) => {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.json', '.yml', '.yaml']

    return callback(null, allowedExtensions.indexOf(extension) > -1)
  },
  . . .
```

- **Mandatory**
- Receives a `filename`. It is the full path to the file including name and extension
- Returns a callback function with signature `(err, result) => {}`
    - `result` is a `string` or `boolean` indicating whether the plugin should process the given file. `filename`. It is a string, it is evaluated as `true` and the string value is used as the target file extension when `render()` is available

- Example returning a `string` from `page.js`

```
  . . .
  // calls back with a result indicating whether this class should process the given file.
  check (filename, callback) {
    const extension = path.extname(filename).toLowerCase()
    const allowedExtensions = ['.html', '.md', '.mdown', '.markdown', '.handlebars', '.hbs']
    let isFound = allowedExtensions.indexOf(extension) > -1
    return callback(null, isFound ? '.html' : false)
  },
  . . .
```

---

### parse()

- Example from `ctx-datafile.js`

```
  . . .
  parse: (file, callback) => {
    var data = null

    function isJSON () {
      return file.path.ext.toLowerCase() === '.json'
    }

    function isYML () {
      var ext = file.path.ext.toLowerCase()
      return ext === '.yml' || ext === '.yaml'
    }

    if (isJSON()) {
      // if not the first time, delete cache
      if (file.data) delete require.cache[require.resolve(file.path.full)]
      data = require(file.path.full)
    }

    if (isYML()) data = yaml.safeLoad(fs.readFileSync(file.path.full, 'utf8'))

    return callback(null, data)
  }
  . . .
```

- **Optional**
- Receives a `file` object. It is the new instance of the `filetype` class that the plugin serves
- Returns or not a callback with the signature  `(err, data) => {}`
    - `data` is the processed file data to be added to `context` object

---

### render()


- Example from `app-stylesheet.js`

```
  . . .
  render: (file, context, callback) => {
    let output

    if (file.isCSS) {
      output = myth(file.input, {source: file.path.full})
      return callback(null, output)
    }

    if (file.isLess) {
      return less.render(file.input, {filename: file.path.full}, function(err, output){
        if (err) throw err
        return callback(null, output.css)
      })
    }

    if (file.isStylus) {
       output = stylus(file.input)
        .set('filename', file.path.full)
        .set('paths', [path.dirname(file.path.full)])
        .render()
      return callback(null, output)
    }

    if (file.isSass) {
      output = sass
        .renderSync({data: file.input, indentedSyntax: true})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    if (file.isSCSS) {
      output = sass
        .renderSync({data: file.input})
        .css
        .toString('utf8')
      return callback(null, output)
    }

    return callback(null, file.input)
  }
  . . .
```

- **Optional**
- Receives a `file` object. It is the particular instance of  filetype class  to be rendered
- Receives a `context` object. It is the only instance of the `Context` class that is available to the application. Sometimes referred as `context` or `ctx`
- Returns a callback with the signature  `(err, output) => {}`
    - `output` is the processed file data to be sent by `express` server in response to a `GET` HTTP request

Note:
- `routes.js` sets `express` server to render a file with different function signature `file.render(context, callback)`
- `file.js` translates to plugin signature `render(file, context, callback)`

---

### priority

- Example from `app-layout.js`

```
  . . .
  // Defines "check(filename, ...)"s relative order
  // (lower means, least priority) only relevant when loading plugins array
  priority: 30,
  . . .
```

- **Optional**
- Number used to define the `check()` function precedence between plugins when conflicting plugins are present. Conflicting means, an overlap of the filetypes they serve.

---

### filetype

- Example from `app-script.js`

```
  . . .
  // Optional because filetype could be assigned by filename or name attribute above
  filetype: 'script',
  . . .
```

- **Optional**
- String with the **exact** filetype the plugin serves. This is the first option to look for the plugin/filetype match.

---

### name

- Example from `app-stylesheet.js`

```
  . . .
   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",
  . . .
```

- **Optional**
- String which **includes** the filetype the plugin serves. This is the third failover option to look for the plugin/filetype match. The second failover option is the **plugin filename itself** by **including** the filetype the plugin serves
