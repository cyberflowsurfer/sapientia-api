'use strict'

const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});
const dbClient = new AWS.DynamoDB.DocumentClient()
const uuid     = require('uuid')

module.exports = function createQuote(request, tableName) {
  console.log(JSON.stringify(request))
  let quote     = validateRequest(request)
  tableName     = tableName || "quotes"

  let createParams = {
    TableName: tableName,
    Item: {
      id:      uuid(),
      author:  quote.author,
      created: new Date().toLocaleString( 'sv', { timeZoneName: 'short' } ),
      quote:   quote.quote,
      source:  quote.source,
      tags:    quote.tags,
      when:    quote.when
    }
  }

  let queryParams = {
    TableName: tableName,
    ProjectionExpression: 'id',
    FilterExpression: "#quote = :quote",
    ExpressionAttributeNames: {
      "#quote": "quote",
    },
    ExpressionAttributeValues: {
        ':quote': quote.quote
    }
  }

  return dbClient.scan(queryParams).promise() 
  .then((res) => {
    if (res.Items.length > 0) {
      console.log(`Quote already exists ${res.Items[0].id}`)
      return { id: res.Items[0].id } 
    }
    return dbClient.put(createParams).promise()
    .then((res) => {
      res.id = createParams.Item.id
      console.log(`Created quote: ${res.id}`)
      return res
    })
    .catch((error) => {
      console.log(`Error creating quote ${error}`)
      throw error
    })

  })
  .catch( (error) => {
    console.log(`Error querying for existence ${error}`)
    throw error  
  })
}  


function validateRequest(request) {
  if (!request) {
    throw new Error('Invalid request')
  }
  let quote = request.body
  if (!quote.author) {
    throw new Error('Missing author')   
  }
  if (!quote.quote) {
    throw new Error('Missing quote')   
  }
  return quote
}
