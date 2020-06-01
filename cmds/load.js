// load.js
const axios    = require('axios');
const fs       = require('fs');
const yaml     = require('js-yaml');
const { exit } = require('process');
const args     = process.argv.slice(2);


if (args.length != 1) {
  console.log(`Usage: ${process.argv[1]} <file>`)
  exit(-1)
}
let fileName = args[0]
if (!fs.existsSync(fileName)) {
  fileName = './../data/' + fileName
}
if (!fs.existsSync(fileName)) {
  console.log(`**** Error: File does not exist ${fileName}`)
  exit(-1)
}
const url_base = assert_env('SAPIENTIA_URL')
// const api_key  = assert_env('AWS_API_KEY')

try {

    let fileContents = fs.readFileSync(fileName, 'utf8');
    let data         = yaml.safeLoad(fileContents);
    
    data.quotes.forEach( (q) => {
      createQuote(url_base, q)
    })
} catch (e) {
    console.log(e);
}

async function createQuote(url_base, q) {
  try {
    const response = await axios.post(url_base + "/quotes", q, {
                                      headers: {
                                        'Content-Type': 'application/json',
//                                        'X-Api-Key': api_key
                                      } })
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

function assert_env(var_name) {
  let result = process.env[var_name]
  if (result == undefined) {
    console.log(`Environment variable ${var_name} not defined`)
    exit(-1)
  }
  return result
}
