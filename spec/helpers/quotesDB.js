'use strict'


const utils = require('./../helpers/utils')


/**
 * Integration test helpers
 */

const AWS       = require('aws-sdk') 
const dynamoDb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION ? process.env.AWS_REGION : 'us-west-2'
})


/**
 * Creates a DynamoDB table. Returns a promise unless done is specified 
 * @param {string} tableName  - Name of the table to create 
 * @param {*}      done       - Optional test done function
 */
module.exports.createTable = function(tableName, done) {
  let promise = new Promise((resolve, reject) => {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
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
      .then(() => resolve())
      .catch(err => reject(err))
  })
  if (!done) 
    return promise
  promise.then(() => done()).catch(err => done.fail(err))
}


/**
 * Creates a DynamoDB table. Returns a promise unless done is specified 
 * @param {string} tableName  - Name of the table to create 
 * @param {*}      done       - Optional test done function
 */
module.exports.deleteTable = function(tableName, done) {
  let promise = new Promise((resolve, reject) => {
    dynamoDb.deleteTable({ 
      TableName: tableName
    }).promise()
      .then(() => dynamoDb.waitFor('tableNotExists', { 
        TableName: tableName
      }).promise())
      .then(() => resolve())
      .catch(err => reject(err))
  })
  if (!done) 
    return promise
  promise.then(() => done()).catch(err => done.fail(err))
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


module.exports.generateTableName = function(testName) {
  return `quotesTest-${utils.testRunName(testName)}` 
} 