const path      = require('upath')
const fs        = require('fs')
// const globs     = require('gitignore-globs')

// A list of `anymatch` patterns for chokidar to ignore when juicing a directory
// https://www.npmjs.com/package/anymatch

module.exports = function(sourceDir, targetDir){
  var ignores = [
    targetDir,
    path.join(targetDir, '/**'), // target directory (in case it's inside the source directory.. inception!)
    /\/\./,                      // hidden files
    /node_modules/,
    /redirects\.json/,
    /npm-debug\.log/,
  ]

  // Ignore everything in the source directory's gitignore file.
  // var gitignore = path.join(sourceDir, '/.gitignore')
  // if (exists(gitignore)) ignores = ignores.concat(globs(gitignore))

  return ignores
}
