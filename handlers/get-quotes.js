'use strict'

/**
 * GET quotes request handler 
 */
const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()


/**
 * API handler for getting all quotes or a single quote. Fetching of all quotes can be 
 * paginated using the limit and offset parameters. Th filter parameter can be used to 
 * filter returned quotes.
 * 
 * @param {*} request   - 
 * @param {*} tableName - Optional table name, used for testing
 */
module.exports = function getQuotes(request, tableName) {
  tableName = tableName || 'quotes'
  return (typeof request.pathParams.id === 'undefined') ? getAll(request, tableName) : getOne(request, tableName)
}


function getAll(request, tableName) {
  let params = allQueryParams(request, tableName)
  console.log(`getAll ${JSON.stringify(request.queryString)}`)
  console.log(JSON.stringify(params))
  return dbClient.scan(params).promise().then( r => createResult(r) )
}


function allQueryParams(request, tableName) {
  function addExpression(params, name, value, ) {
    params.ExpressionAttributeValues = params.ExpressionAttributeValues || {}
    params.ExpressionAttributeNames  = params.ExpressionAttributeNames || {}
    let expr  
    value = decodeURIComponent(value.replace(/^"|"$/g, '')) // Strip quotes

    if (name == 'tag' || name == 'tags') {
      name = 'tags'   
      params.ExpressionAttributeNames[`#${name}`]  = name   
      let i = 1
      value.split('&').forEach( v => {
        expr = expr ? expr + " and " : ""
        expr +=  `contains( #tags, :${name}${i} )`
        params.ExpressionAttributeValues[`:${name}${i}`] = v
        i++
      })
    } else {
      expr = `#${name} = :${name}`
      params.ExpressionAttributeValues[`:${name}`] = value
      params.ExpressionAttributeNames[`#${name}`]  = name 
    }

  
    if (params.FilterExpression)
      params.FilterExpression += ` and #${name} = :${name}`
    else
      params.FilterExpression = expr
  }

  let params = { 
    TableName: tableName
  }

  if (request.queryString.limit) {
    params.Limit =  request.queryString.limit
  }
  if (request.queryString.offset) {
    params.ExclusiveStartKey = { "id": request.queryString.offset}
  }

  if (request.queryString.author) {
    addExpression(params, 'author', request.queryString.author)
  }
    
  if (request.queryString.subject) {
    addExpression(params, 'subject', request.queryString.subject)
  }

  if (request.queryString.source) {
    addExpression(params, 'source', request.queryString.source)
  }

  if (request.queryString.tags) {
    addExpression(params, 'tags', request.queryString.tags)
  }

  // ?filter="<att>=<value>"
  if (request.queryString.filter) {
    let filter = request.queryString.filter.replace(/^"|"$/g, '') // Strip quotes 
    filter     = decodeURIComponent(filter).split('=')  

    if (filter.length == 2) {
      addExpression(params, filter[0], filter[1])
    }
  }
  
  return params
}



function createResult(r) {
  let result = { items: r.Items }

  if (r.LastEvaluatedKey) {
    console.log(`LastEvaluatedKey ${JSON.stringify(r.LastEvaluatedKey)}`)
    result.offset = r.LastEvaluatedKey.id
  }
  return result 
}


function getOne(request, tableName) {
  return dbClient.query({
    TableName: tableName,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ':id': request.pathParams.id
    }
  })
  .promise()
  .then(result => {
    return result
  })
}



