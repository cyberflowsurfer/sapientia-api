'use strict'

/**
 * Integration test for create-quote
 */

const underTest = require('../../handlers/create-quote') 
const AWS       = require('aws-sdk') 
const util      = require('util');
const dynamoDb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION ? process.env.AWS_REGION : 'us-west-2'
})

const tableName = `quotesTest${new Date().getTime()}` 
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 

var request

describe('Create quote integration test', () => {
  beforeAll((done) => {
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
  })

  afterAll(done => {
    dynamoDb.deleteTable({ 
      TableName: tableName
    }).promise()
      .then(() => dynamoDb.waitFor('tableNotExists', { 
        TableName: tableName
      }).promise())
      .then(done)
      .catch(done.fail)
  })


  it('Create a new quote', (done) => {
    request = {
      body: { author: "Grady Booch", quote: 'This additional code is so literate, so easy to read, that comments might even have gotten in the way', tags: ["computers"] }
    }
    underTest(request, tableName)
      .then(response => {
        const params = {
          Key: {
            id: {
              S: response.id
            }
          },
          TableName: tableName
        }

        dynamoDb.getItem(params).promise()
          .then(result => {
            expect(result.Item.id.S).toBe(response.id)
            expect(result.Item.quote.S).toBe(request.body.quote)
            expect(result.Item.author.S).toBe(request.body.author)
            done()
          })
          .catch(done.fail)
      })
      .catch(done.fail)

  })

})