'use strict'

/**
 * Utility for listing quotes
 */
const axios    = require('axios');
const { exit } = require('process');
const utils    = require('./utils')

const argv     = require('yargs').argv

const url_base = utils.assert_env('SAPIENTIA_URL') + "/quotes"


;(async () => {
  let url = url_base
  let response
  do {
    console.log(url)
    response = await getQuotes(url)
    response.data.items.forEach( (q) => {
      printQuote(q)
    })
    console.log(`------ ${response.data.offset}`)
    if (response.data.offset)
      url = url_base + "?offset=" + encodeURIComponent(response.data.offset)
  } while (response.data.offset)
})()


function printQuote(q) {
  const pad = (s, n) => {
    s = s == undefined ? "" : "" + s
    return s.padEnd(n)
  }
  console.log(pad(q.id,38) + pad(q.when,6)  + pad(q.author,16) + q.quote.substr(0,30) + "..." )
}



async function getQuotes(url) {
  try {
    const response = await axios.get(url)
    if (response.status != 200) {
      console.log(`status: ${response.status} ${response.statusText}`)
    }
    return response
  } catch (error) {
    console.error(error)
  }
}



