'use strict'

/**
 * GET quotes request handler 
 */
const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

const quotes = require('../data/quotes.json')

function getAll(request) {
  if (request.queryString.test) {
    return quotes
  }
  return dbClient.scan({
    TableName: 'quotes'
  })
  .promise()
  .then(result => result.Items)
}


function getOne(request) {
  if (request.queryString.test) {
    const quote = quotes.find((quote) => quote.id == id)
    if (quote)
      return quote
    else
      throw new Error(`Quote not found: ${id}`)
  }
  return dbClient.get({
    TableName: 'quotes',
    Key: {
      id: id
    }
  })
  .promise()
  .then(result => result.Items)
}


module.exports = function getQuotes(request) {
  return (typeof request.pathParams.id === 'undefined') ? getAll(request) : getOne(request)
}

