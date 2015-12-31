# jus

jus is an opinionated zero-configuration framework for building static websites.

- Pages are written in Markdown, HTML, and Handlebars.
- Scripts are written in ES5, ES6, or ES2015, and are automatically browserified and babelified.
- Stylesheets are written in CSS, Stylus, Sass, or SCSS.
- Images and Datafiles have their metadata squeezed out and made available to Pages.

**This project is experimental. Not ready for public use!**

## Installation

[Node.js](https://nodejs.org/en/download/) version 4 or greater is required.

```sh
npm i jus --global
```

## Usage

Run the server in a directory full of files:

```
jus serve
```

### Pages

Pages are written in Markdown, HTML, Handlebars, or any combination thereof. At render time each Page is passed a handlebars context. The context is a JSON object containing all the data about all the files in the directory.

- Markdown parsing with [marky-markdown](npm.im/marky-markdown)
- Syntax Highlighting with Atom.io's [highlights](npm.im/highlights)
- Supports [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/), including [fenced code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks)
- Extracts [HTML Frontmatter](https://www.npmjs.com/package/html-frontmatter) as metadata

Extensions: `html|hbs|handlebars|markdown|md`

### Scripts

Scripts can be written in ES5, ES6, and ES2015. They are [browserified](https://github.com/substack/browserify-handbook#readme) with [babelify](https://www.npmjs.com/package/babelify) using the `es2015` and `react` presets, which
means you can `require` or `import` node modules in them!

Extensions: `js|jsx|es|es6`

### Stylesheets

Stylesheets can be written in Sass, SCSS, Stylus, or plain CSS

Extensions: `css|sass|scss|styl`

### Templates

Templates are written in Handlebars.

- They must include a `{{{body}}}` string, to be used as a placeholder for where the main content should be rendered.
- They must have the word `layout` in their filename.
- If a file named `/layout.(html|hbs|handlebars|markdown|md)` is present, it will be applied to all pages by default.
- Pages can specify a custom layout in their [HTML frontmatter](https://www.npmjs.com/package/html-frontmatter). Specifying `layout: foo` will refer to the `/layout-foo.(html|hbs|handlebars|markdown|md)` layout file.
- Pages can disable layout by setting `layout: false`.

Extensions: `html|hbs|handlebars|markdown|md`

### Images

Delicious metadata is extracted from images and included in the handlebars context object, which is accessible to every Page.

- Extracts [EXIF data](https://en.wikipedia.org/wiki/Exchangeable_image_file_format) from JPEGs, including [geolocation  data](https://en.wikipedia.org/wiki/Exchangeable_image_file_format#Geolocation).
- Extracts [dimensions](https://www.npmjs.com/package/image-size)
- Extracts [color palettes](https://www.npmjs.com/package/get-image-colors)

Extensions: `png|jpg|gif|svg`

### Datafiles

JSON and YML files are slurped into the handlebars context object, which is accessible to every Page.

Extensions: `json|yaml|yml`

## Tests

[![Build Status Images](https://travis-ci.org/zeke/jus.svg)](https://travis-ci.org/zeke/jus)

```sh
npm install
npm test
```
