'use strict'

/**
 * Utility for loading quotes from a yaml file (default location ../data)
 */
const axios    = require('axios');
const fs       = require('fs');
const { exit } = require('process');
const utils    = require('./utils')
const args     = process.argv.slice(2);


if (args.length != 1) {
  console.log(`Usage: ${process.argv[1]} <file>`)
  exit(-1)
}
let fileName = args[0]
if (!fs.existsSync(fileName)) {
  fileName = './../data/' + fileName
}
utils.assert_fileExists(fileName)

const url = utils.assert_env('SAPIENTIA_URL') + "/quotes"
// const api_key  = assert_env('AWS_API_KEY')


try {
    let data = utils.readYamlSync(fileName)
    
    data.quotes.forEach( (q) => {
      createQuote(url, q)
    })
} catch (e) {
    console.log(e);
}


async function createQuote(url, q) {
  try {
    const response = await axios.post(url, q, {headers: utils.headers()})
    console.log(`status: ${response.status} ${response.statusText}  ${response.data.id}  ${q.quote.substr(0,20)}...`)
    if (response.status != 200) {
//      console.log(res.body)
      console.log(`${q.quote}\n`)
    }
  } catch (err) {
    console.log(`status: ${err.response.status} ${err.response.statusText}  ${q.quote.substr(0,20)}...`)
    console.log(JSON.stringify(err.response.data))
  }
}
