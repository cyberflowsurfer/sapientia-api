'use strict'

/**
 * Integration test helpers
 */

const AWS       = require('aws-sdk') 
const dynamoDb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION ? process.env.AWS_REGION : 'us-west-2'
})


module.exports.createTable = function(tableName, done) {
  const params = {
    AttributeDefinitions: [{
      AttributeName: 'id',
      AttributeType: 'S'
    }],
    KeySchema: [{
      AttributeName: 'id',
      KeyType: 'HASH'
    }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: tableName
  }
  dynamoDb.createTable(params).promise() 
    .then(() => dynamoDb.waitFor('tableExists', { 
      TableName: tableName
    }).promise())
    .then(done)
    .catch(done.fail)
}


module.exports.deleteTable = function(tableName, done) {
    dynamoDb.deleteTable({ 
      TableName: tableName
    }).promise()
      .then(() => dynamoDb.waitFor('tableNotExists', { 
        TableName: tableName
      }).promise())
      .then(done)
      .catch(done.fail)
}


module.exports.getItem = function(tableName, id) {
  const params = {
    Key: {
      id: {
        S: id
      }
    },
    TableName: tableName
  }  
  return dynamoDb.getItem(params).promise()
}


module.exports.generateTableName = function() {
  return `quotesTest${new Date().getTime()}` 
}