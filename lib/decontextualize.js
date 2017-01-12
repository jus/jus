const pluralize       = require('inflection').pluralize
const remove          = require('lodash').remove


module.exports = function decontextualize(context, files) {
  var partials
  var datafiles
  var images

// Backwards order than `contextualize()`
  // (to perform like an Undo contextualize)
  // ********
  // STEP ONE
  // ********
  // First remove the `files` relations from all `pages`
  //
  // prepare filters for `files` that have a relation in `pages`
  partials = files.filter(f => f.type === 'partial')
  datafiles = files.filter(f => f.type === 'datafile')
  images = files.filter(f => f.type === 'image')
  //
  // Remove relations
  context.pages.forEach(page => {

    // Remove `partials` data from `page`
    partials.forEach(partial => {
      delete page.data[partial.name]
      delete page[partial.name]
    })

    // Remove `datafiles` data from `page`
    datafiles.forEach(datafile => {
      delete page.data[datafile.path.name]
    })

    // Remove `images` data from `page`
    images.forEach(image => {
      delete page.images[image.path.name]
    })

  })

  // ********
  // STEP TWO
  // ********
  // Now is safe to remove `files` from `context`
  files.forEach(file => {
    const t = pluralize(file.type)

    if (file.type === 'partial') delete context[t][file.name]
    if (file.type === 'layout') delete context[t][file.name]

    delete context[t][file.keyName]

    // Oposite operation to context[t].push(file)
    context[t] = context[t].filter(f => f.path.full !== file.path.full)

    delete context.files[file.keyName]

    // Oposite operation to context.files.push(file)
    context.files = context.files.filter(f => f.path.full !== file.path.full)

  })

  // ********
  // FINAL STEP
  // ********
  // Nothing else to do, just return modified context
  return context
}
