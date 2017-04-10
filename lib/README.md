# Code Overview
`jus` application starts in `cli.js`.
## cli.js
Takes care of the Command Line Interface to start the application

Usage:
```
  jus serve                         Serve the current directory
  jus serve <source>                Serve a specific directory
  jus serve <source> --port 1337    Use a custom port. Default is 3000
  jus compile <source> <target>     Compile source files to static assets
  jus help                          Open jus.js.org in your browser
```
Has two main command:
1. `serve` serviced by `lib/server.js`
2. `complie` serviced by `lib/compiler.js`

## cli.js > server.js
- Set up `express` server
- Set up `browser-sync`
- Invokes asynchronous function `jus` serviced by `lib/jus.js` with following events:
    - `started` begin building the `context`
    - `squeezing` to report number of files being 'squeezed'
    - `squeezed` when `context` is ready. Starts `express` server in `http://localhost:<port>`
    - Other reporting events
      - `file-add`
      - `file-update`
      - `file-delete`

## cli.js > compiler.js
- Invokes asynchronous function `jus` serviced by `lib/jus.js` with following events:
    - `started` begin building the `context`
    - `file-add` to report each file while being added to `context`
    - `squeezing` to report number of files being 'squeezed'
    - `squeezed` when `context` is ready. Renders and writes each file in the target directory mirroring the structure of the source directory. Not renderable files are just copied if relevant

## jus.js
- Middleware bewteen a `Contextualizer` and the server or the compiler
- Sets up **custom plugins** (file handlers)
- Starts a directory **watcher** that performs the file contextualizing on real time
- Mirrors the underlying directory **watcher** events

## jus.js > contextualizer.js
- Load **standard plugins** for default file handling
- Handles the **custom plugin** Loading
- Handles the underlying directory **watcher** `chokidar` events:
    - `add` there is a file to be added to the context and calls `contextualizer.createFile()` that:
        - Scan all plugins by precedence to select the appropriate one
        - Create an instance of the file type defined by the plugin
        - Contextualize the file
    - `change` an existing file has been updated and calls `contextualizer.updateFile()` that:
        - Find the corresponding instance
        - Performs appropriate read and parse
    - `unlink` an existing file has been deleted and calls `contextualizer.deleteFile()` that:
        - Find the corresponding instance
        - Removes the file and file relations from the context
    - `ready` the first directory sweep has been finished so starts an interval review for context to be also ready
