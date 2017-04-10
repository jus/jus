# Plugins API
A plugin is a module that exports an object with functions to process a particular file type
- `check()` - Function that calls back with a boolean indicating whether this plugin should process the given file
- `parse()` - Function that interprets/extracts file data
- `render()` - Function externally called by `express` server to answer a file `GET` HTTP request
- `toExtension()` - Function to change the filename extension in accordance with `parse()` output like converting ` .sass ` to ` .css `
- ... and some support data like `filetype` , `name` and `priority`

---

### check()

- Example from `datafile-std.js`

```
  . . .
  // calls back with a boolean indicating whether this class should process the given file.
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
    - `result` is boolean indicating whether the plugin should process the given file. `filename`

---

### parse()

- Example from `datafile-std.js`

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


- Example from `stylesheet-std.js`

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

### toExtension()

- Example from `stylesheet-std.js`

```
  . . .
  toExtension: (oldExt) => {
    // Simple rule, force to '.css'
    return '.css'
  },
  . . .
```

- **Optional**
- Receives a `oldExt` string. It is the original filename extension
- Returns a string that may o may not depend on `oldExt` value to change the target file path extension

---

### priority

- Example from `layout-std.js`

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

- Example from `script-std.js`

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

- Example from `stylesheet-std.js`

```
  . . .
   // Used as the last failover to deduct file type class, just edit and uncomment
   // name: "what-ever-text including the filetype class works",
  . . .
```

- **Optional**
- String which **includes** the filetype the plugin serves. This is the third failover option to look for the plugin/filetype match. The second failover option is the **plugin filename itself** by **including** the filetype the plugin serves
