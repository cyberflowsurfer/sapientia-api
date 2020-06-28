'use strict'

const AWS      = require('aws-sdk')
const dbClient = new AWS.DynamoDB.DocumentClient()

/**
 * API handler for deleting a quote by id 
 * @param {*} id        - The id of the quote to be deleted
 * @param {*} tableName - Optional testability parameter
 */
module.exports = function deleteQuote(id, tableName) {
  tableName = tableName || 'quotes'
  
  return dbClient.delete({
    TableName: tableName, 
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

