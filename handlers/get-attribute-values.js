'use strict'

/**
 * Request handler for returning a list of the unique values for a specified attrbute
 * For example, /tags, /sources, ...
 */
const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()


module.exports = function getAttributeValues(request, att, tableName) {
  tableName = tableName || 'quotes'
  // TODO: Should we use a ProjectionExpression?
  let params = {
    TableName: tableName,
  }

   // TODO: This does not handle paginating multiple requests nor paginating results
  return dbClient.scan(params).promise()
  .then( (r) => {
    let values = new Set()
    r.Items.forEach( (quote) => {
      let att_values = quote[att]
      if (!Array.isArray(att_values))
        att_values = [ att_values ]
      att_values.forEach( v => {
        if (v)
          values.add(v) 
      })
    })
    return {
      items: [...values]
    }
  })
}

