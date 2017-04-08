## Using Plugins

Plugins are file handlers that take care of  the **parsing** and **rendering**

Visit [Plugin API README](./standard/README.md) for programming details

### File types

` jus ` has 7 file types:

- ` datafiles `
- ` images `
- ` layouts `
- ` pages `
- ` scripts `
- ` stylesheets `
- ` unknowns `

Some files are just parsed, others are just rendered and some need both process

### Directories

There are 3 directories dedicated to Plugins

- `standard` directory - Hold the 7 plugins required to process the corresponding file types listed above. At start, `jus` looks for them as the minimum way to handle the file types

- `use` directory - Hold any additional plugin to override the "standard" ones. This is the place to **just drop** the desired plugins. `jus` reads all and "places" them above the "standards" to have precedence

- `stored` directory - Hold unused plugins. `jus` is not aware of them at all. The directory is there just for convenience while **dragging and dropping** / **mixing and matching** plugins to suit

### npm install

The plugins **NEED** their dependencies be installed prior to running

### Example:

Plugin `stylesheetCSSnext.js` requires:

```
'use strict'

const postcssCssnext  = require("postcss-cssnext")
const path            = require('upath')

module.exports = {
. . .
```
Only needs `postcss-cssnext` to be installed because `upath` is already installed by `jus`

##### Steps

1. Install `postcss-cssnext`

       npm install postcss-cssnext --save

2. "Drag and drop" plugin `stylesheetCSSnext.js` in `lib/plugins/use` directory

3. Run `jus`. That's it!
Now you can "Use tomorrow’s CSS syntax, today."

<small>Note:<br>At time of writing, there is a bug related to `postcss-cssnext` dependencies `caniuse-api` and `caniuse-db`<br>You can [read more here](https://github.com/MoOx/postcss-cssnext/issues/357#issuecomment-288636350)<br>
Appears this error: `cannot read property 'stats' of undefined`<br>
There is a easy **workaround**. Just delete the directories `node_modules/caniuse-api` and `node_modules/caniuse-db` then run `npm install`</small>
