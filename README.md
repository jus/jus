# jus [![Build Status](https://travis-ci.org/jus/jus.svg?branch=master)](https://travis-ci.org/jus/jus)

jus is a development server and build tool for making static websites with no configuration and no boilerplate code. It has built-in support for [browserify](https://github.com/substack/browserify-handbook#readme), ES6 and ES2015 with [Babel](http://babeljs.io/), [React JSX](http://babeljs.io/docs/plugins/preset-react/), GitHub Flavored markdown, syntax highlighting, [Sass](http://sass-lang.com/), [Less](http://lesscss.org/), [Stylus](http://stylus-lang.com/), [Myth](http://www.myth.io/), [Handlebars](http://handlebarsjs.com/), [browsersync](https://browsersync.io/) and more.

Learn all about it at [jus.js.org](http://jus.js.org)

## TLDR

```sh
npm i -g jus && jus
```

## Dependencies

- [async](https://github.com/caolan/async): Higher-order functions and common patterns for asynchronous code
- [babel-preset-es2015](https://github.com/babel/babel/tree/master/packages): Babel preset for all es2015 plugins.
- [babel-preset-react](https://github.com/babel/babel/tree/master/packages): Babel preset for all React plugins.
- [babelify](https://github.com/babel/babelify): Babel browserify transform
- [browser-sync](https://github.com/browsersync/browser-sync): Live CSS Reload &amp; Browser Syncing
- [browserify](https://github.com/substack/node-browserify): browser-side require() the node way
- [chalk](https://github.com/chalk/chalk): Terminal string styling done right. Much color.
- [cheerio](https://github.com/cheeriojs/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [chokidar](https://github.com/paulmillr/chokidar): A neat wrapper around node.js fs.watch / fs.watchFile / fsevents.
- [concat-stream](https://github.com/maxogden/concat-stream): writable stream that concatenates strings or binary data and calls a callback with the result
- [connect-browser-sync](https://github.com/schmich/connect-browser-sync): Connect middleware for BrowserSync.
- [cors](https://github.com/expressjs/cors): middleware for dynamically or statically enabling CORS in express/connect applications
- [event-emitter](https://github.com/medikoo/event-emitter): Environment agnostic event emitter
- [exif-parser](https://github.com/bwindels/exif-parser): A javascript library to extract Exif metadata from images, in node and in the browser.
- [express](https://github.com/expressjs/express): Fast, unopinionated, minimalist web framework
- [fs-extra](https://github.com/jprichardson/node-fs-extra): fs-extra contains methods that aren&#39;t included in the vanilla Node.js fs package. Such as mkdir -p, cp -r, and rm -rf.
- [get-image-colors](https://github.com/zeke/get-image-colors): Extract colors from images. Supports GIF, JPG, PNG, and even SVG!
- [handlebars](https://github.com/wycats/handlebars.js): Handlebars provides the power necessary to let you build semantic templates effectively with no frustration
- [href-type](https://github.com/zeke/href-type): Test whether an href string is absolute, relative, protocol-relative, mailto:, tel:, sms:, etc
- [html-frontmatter](https://github.com/zeke/html-frontmatter): Extract key-value metadata from HTML comments
- [image-size](https://github.com/image-size/image-size): get dimensions of any image file
- [inflection](https://github.com/dreamerslab/node.inflection): A port of inflection-js to node.js module
- [js-yaml](https://github.com/nodeca/js-yaml): YAML 1.2 parser and serializer
- [less](https://github.com/less/less.js): Leaner CSS
- [lil-env-thing](https://github.com/zeke/lil-env-thing): A tiny convenience module for managing process.env.NODE_ENV
- [lobars](https://github.com/zeke/lobars): lodash functions as handlebars helpers
- [lodash](https://github.com/lodash/lodash): Lodash modular utilities.
- [minimist](https://github.com/substack/minimist): parse argument options
- [morgan](https://github.com/expressjs/morgan): HTTP request logger middleware for node.js
- [myth](https://github.com/segmentio/myth): A CSS preprocessor that acts like a polyfill for future versions of the spec.
- [node-sass](https://github.com/sass/node-sass): Wrapper around libsass
- [open](https://github.com/pwnall/node-open): open a file or url in the user&#39;s preferred application
- [require-dir](https://github.com/aseemk/requireDir): Helper to require() directories.
- [remark](https://github.com/wooorm/remark): a markdown processor powered by plug-ins
- [remark-html](https://github.com/wooorm/remark-html): Compile markdown to HTML with remark
- [stylus](https://github.com/stylus/stylus): Robust, expressive, and feature-rich CSS superset
- [tmp](https://github.com/raszi/node-tmp): Temporary file and directory creator

## Dev Dependencies

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [nixt](https://github.com/vesln/nixt): Simple and powerful testing for command-line apps
- [path-exists](https://github.com/sindresorhus/path-exists): Check if a path exists
- [supertest](https://github.com/visionmedia/supertest): Super-agent driven library for testing HTTP servers
