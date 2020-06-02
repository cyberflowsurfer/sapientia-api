'use strict'

/**
 * GET quotes request handler 
 */
const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()


module.exports = function getQuotes(request) {
  return (typeof request.pathParams.id === 'undefined') ? getAll(request) : getOne(request)
}


function getAll(request) {
  return dbClient.scan(allQueryParams(request)).promise().then( r => createResult(r) )
}


function allQueryParams(request) {
  let params = {
    TableName: 'quotes',
    Limit: request.queryString.limit ? request.queryString.limit : 5
  }
  if (request.queryString.offset) {
    params.ExclusiveStartKey = { "id": request.queryString.offset}
    console.log(`ExclusiveStartKey ${JSON.stringify(params.ExclusiveStartKey)}`)
  }
  return params
}


function createResult(r) {
  let result = {
    items: r.Items
  }
  if (r.LastEvaluatedKey) {
    console.log(`LastEvaluatedKey ${JSON.stringify(r.LastEvaluatedKey)}`)
    result.offset = r.LastEvaluatedKey.id
  }
  return result 
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



