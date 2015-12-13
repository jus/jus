# jus

Squeeze metadata out of a directory full of files.

## Pages

Pages are written in Markdown, HTML, or Handlebars, or a combination thereof.

## Images

EXIF data
Dimensions (width, height)
Color Palette Extraction
Supports PNG, JPG, GIF, and SVG

## Data files

JSON and YML files are detected and passed to Handlebars templates.

## Scripts


## Styles


- Markdown parsing with [marky-markdown](npm.im/marky-markdown)
- Syntax Highlighting with Atom.io's [highlights](npm.im/highlights)
- Handlebars
- Supports [clean URLs](https://surge.sh/help/using-clean-urls-automatically)
- HTML Frontmatter from HTML and Markdown files
- Color palettes from PNG, JPG, GIF, and SVG files
- EXIF data from images

## Installation

```sh
npm i -g jus
```

## Tests

[![Build Status Images](https://travis-ci.org/zeke/jus.svg)](https://travis-ci.org/zeke/jus)

```sh
npm install
npm test
```
