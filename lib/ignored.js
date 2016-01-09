const path      = require('path')
const fs        = require('fs')
const exists    = require('path-exists').sync
// const globs     = require('gitignore-globs')

// A list of `anymatch` patterns for chokidar to ignore when juicing a directory
// https://www.npmjs.com/package/anymatch

module.exports = function(sourceDir, targetDir){
  var ignores = [
    targetDir,
    path.join(targetDir, '/**'), // target directory (in case it's inside source directory.. inception!)
    /^\./,
    /node_modules/,
    /redirects\.json/,
    /npm-debug\.log/,
  ]

  // Ignore everything in the source directory's gitignore file.
  // var gitignore = path.join(sourceDir, '/.gitignore')
  // if (exists(gitignore)) ignores = ignores.concat(globs(gitignore))

  return ignores
}
