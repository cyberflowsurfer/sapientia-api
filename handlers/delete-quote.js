'use strict'

const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

module.exports = function deleteQuote(id) {
  return dbClient.delete({
    TableName: 'quotes', 
    Key: { id: id }
  })
  .promise()
  .then((result) => {
      console.log(`Deleted quote: ${id}`)
      return result
  })
  .catch((error) => {
      console.log(`Error deleting quote: ${error}`)
      throw error
  })
}

