const isEmpty         = require('lodash').isEmpty
const keys            = require('lodash').keys
const pluralize       = require('inflection').pluralize
const primitives      = require('require-dir')('./files')

module.exports = function contextualize(context, files) {
  // Receives a prexisting context and add new files to it
  // Returns the updated context

  // ********
  // STEP ONE
  // ********
  // Only operations that affect `context` and operations that do not affect
  // relations between `files`
  files.forEach(file => {
    const t = pluralize(file.type)

    // ADD FILE FIRST TIME IN `FILES` ARRAY
    // ====================================
    //
    // Add file to a general array named `files`
    // Ex. context.files = [file0, file1, file2, ...etc]
    context.files.push(file)

    // ADD FILE SECOND TIME - NAMED KEYS IN SAME `FILES` ARRAY
    // ========================================
    //
    // Create named key in the array, for easy access
    // Ex. context.files['/styles/foo.sass']
    context.files[file.keyName] = file

    // ADD FILE THIRD TIME IN ITS TYPE ARRAY
    // =====================================
    // They are already present in the `files` array, but this makes the data
    // easier to use within a handlebars template
    //
    // Add file to its type array
    // Ex. context.stylesheets = [file0, file1, file2, ...etc]
    context[t].push(file)

    // ADD FILE FOURTH TIME - NAMED KEYS IN ITS TYPE ARRAY
    // =====================================
    // Create named keys, for easy access
    // context.pages['/index.md']
    // context.stylesheets['/styles/foo.sass']
    // context.datafiles.baz_wibble
    context[t][file.keyName] = file

    // MORE ADDING PER SPECIAL CASES
    // =============================
    //
    // --- Only for 'layout' type ---
    // Add by name. Ex. context.layouts.foo <-- file
    if (file.type === 'layout') context[t][file.name] = file

    // --- Only for 'partial' type ---
    // Add by name. Ex. context.partial.bar <-- file
    if (file.type === 'partial') context[t][file.name] = file

  })

  // ********
  // STEP TWO
  // ********
  // Once previous and new `files` are in context, perform operations that
  // affect relation bewteen `files`
  // Only `files` of type `page` are recontextualized to reflect changes
  context.pages.forEach(page => {
    // Attach image metadata to pages in the same directory
    page.images = {}
    context.images.forEach(image => {
      if (image.path.dir === page.path.dir) {
        page.images[image.path.name] = image
      }
    })

    // Attach JSON and YAML data to pages in the same directory
//    page.data = {}
    context.datafiles.forEach(datafile => {
      if (datafile.path.dir === page.path.dir) {
        page.data[datafile.path.name] = datafile.data
      }
    })

    // Add (all) partial.data to page in two places
    // one under partialname and other deeper under partialname.data
    // ex. page.partialFoo.frontmatterBar and
    //       page.partialFoo.data.frontmatterBar
    context.partials.forEach(partial => {
      var data = partial.data
      if (!isEmpty(data)) { // If no data, just skip to next partial
        page[partial.name] = {}
        page.data[partial.name] = {}
        // Attach data twice at two different levels
        Object.assign(page[partial.name], data)
        Object.assign(page.data[partial.name], data) // for JSON rendering
      }
    })

  })

  // ********
  // FINAL STEP
  // ********
  // Nothing else to do, just return filled context
  return context
}
