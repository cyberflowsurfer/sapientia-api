'use strict'

const fs       = require('fs')
const yaml     = require('js-yaml')


exports.assert_env = function (var_name) {
  let result = process.env[var_name]
  if (result == undefined) {
    console.log(`Environment variable ${var_name} not defined`)
    exit(-1)
  }
  return result
}


exports.assert_fileExists = function (filename) {
  if (!fs.existsSync(filename)) {
    console.log(`**** Error: File does not exist ${filename}`)
    exit(-1)
  }
}


exports.headers = function() {
    return {
      'Content-Type': 'application/json',
  //  'X-Api-Key': api_key
    }
}


exports.readYamlSync = function(filename) {
  return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
}