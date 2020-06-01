'use strict'

const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

module.exports = function updateQuote(request) {
  return dbClient.update({
    TableName: 'orders',
    Key: {
      id: request.id
    },
    UpdateExpression:  'set quote = :q, who = :w, source = :s, when = :wh',
    AttributeUpdates: {
      ':q' : request.body.quote,
      ':w' : request.body.who,      
      ':s' : request.body.source, 
      ':wh' : request.body.when 
    }
  })
}