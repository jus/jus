var env = module.exports = () => {
  return process.env.NODE_ENV
}

env.test = function() {
  return process.env.NODE_ENV === 'test'
}

env.development = function() {
  return process.env.NODE_ENV === 'development'
}

env.production = function() {
  return process.env.NODE_ENV === 'production'
}
