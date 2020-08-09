'use strict'

const fs       = require('fs')
const yaml     = require('js-yaml')
const path     = require('path')
const { exit } = require('process')


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


exports.readDataSync = function(fileName) {
  if (path.extname(fileName) == ".yaml")  {
    return readYamlSync(fileName)
  } else if (path.extname(fileName) == ".json")  {
    return readJsonSync(fileName)
  }
}



function readJsonSync(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'))
}
exports.readJsonSync = readJsonSync


function readYamlSync(filename) {
  return yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
}
exports.readYamlSync = readYamlSync







