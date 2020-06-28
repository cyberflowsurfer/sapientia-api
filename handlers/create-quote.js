'use strict'

const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});
const dbClient = new AWS.DynamoDB.DocumentClient()
var crypto     = require('crypto');

module.exports = function createQuote(request, tableName) {
  let quote     = validateRequest(request)
  tableName     = tableName || "quotes"

  let putParams = {
    TableName: tableName,
    Item: {
      id:      crypto.createHash('md5').update(quote.quote).digest("hex"),
      author:  quote.author,
      created: new Date().toLocaleString( 'sv', { timeZoneName: 'short' } ),
      quote:   quote.quote,
      source:  quote.source,
      tags:    quote.tags,
      when:    quote.when
    }
  }

  console.log('createQuote ----------------------------')
  console.log(JSON.stringify(putParams))
  
  return dbClient.put(putParams).promise() 
  .then( res => {
    res.id = putParams.Item.id
    console.log(`Created quote: ${res.id}`)
    return res
  })
  .catch(err => {
    // TODO Add test for: ConditionalCheckFailedException
    console.log(`Quote already exists ${putParams.Item.id} ${err}`)
    return { id: putParams.Item.id } 
  })
}  


function validateRequest(request) {
  if (!request || !request.body) {
    throw new Error('Invalid request')
  }
  let quote = request.body
  const requiredAttributes = ['author', 'quote']
  const expectedAttributes = ['author', 'subject', 'source', 'tags', 'quote', 'when']
  for (const k in quote) {
    if (!expectedAttributes.includes(k)) {
      throw new Error(`Extra attribute: ${k}`)
    }
  }
  requiredAttributes.forEach( a => {
    if (!quote[a]) 
      throw new Error(`Missing ${a}`)
  })

  return quote
}
