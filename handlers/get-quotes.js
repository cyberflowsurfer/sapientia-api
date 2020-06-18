'use strict'

/**
 * GET quotes request handler 
 */
const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()


module.exports = function getQuotes(request, tableName) {
  tableName = tableName || 'quotes'
  return (typeof request.pathParams.id === 'undefined') ? getAll(request, tableName) : getOne(request, tableName)
}


function getAll(request, tableName) {
  return dbClient.scan(allQueryParams(request, tableName)).promise().then( r => createResult(r) )
}


function allQueryParams(request, tableName) {
  let params = {
    TableName: tableName,
  }
  if (request.queryString.limit) {
    params.Limit =  request.queryString.limit
    console.log(`limit ${params.Limit}`)
  }
  if (request.queryString.offset) {
    params.ExclusiveStartKey = { "id": request.queryString.offset}
    console.log(`ExclusiveStartKey ${JSON.stringify(params.ExclusiveStartKey)}`)
  }

  // ?filter="<att>=<value>"
  // TODO: Add support for other operators
  if (request.queryString.filter) {
    let filter = request.queryString.filter.replace(/^"|"$/g, '')
    filter     = decodeURIComponent(filter).split('=')  

    if (filter.length == 2) {
      if (filter[0] == "tag") {
        params.FilterExpression          = "contains( tags, :value )"
      } else {
        params.FilterExpression          = "#att = :value",
        params.ExpressionAttributeNames  = { "#att":   filter[0] }
      }
      params.ExpressionAttributeValues = { ":value": filter[1] }
    }
    console.log(`Filtering by: ${filter[0]}=${filter[1]}`)

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


function getOne(request, tableName) {
  if (request.queryString.test) {
    const quote = quotes.find((quote) => quote.id == id)
    if (quote)
      return quote
    else
      throw new Error(`Quote not found: ${id}`)
  }
  return dbClient.get({
    TableName: tableName,
    Key: {
      id: id
    }
  })
  .promise()
  .then(result => result.Items)
}



