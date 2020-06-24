'use strict'

/**
 * Integration test for get-attribute
 */
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const underTest    = require('../../handlers/get-attribute-values') 
const QuotesList   = require('../fixtures/quotesList') 
const quotesDB     = require('../helpers/quotesDB')
const create       = require('../helpers/create')
const request      = require('../helpers/request')
const expectHelper = require('../helpers/expect')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 

let quotesList    = new QuotesList('get-attribute', {count: 15})

describe('Get Attribute integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => {
    quotesDB.createTable(tableName)
    .then( () => create.createMany(tableName, quotesList.list(), done) ) 
  })


  afterAll( done => quotesDB.deleteTable(tableName, done) )

  it('Get authors', done => testBody(done, tableName, 'author'))

  it('Get sources', done => testBody(done, tableName, 'source'))

  it('Get tags', done => testBody(done, tableName, 'tags'))

  it('Get when', done => testBody(done, tableName, 'when'))
 
})


function testBody(done, tableName, att) {
  underTest(request.create(), att, tableName)
  .then(response => {
    expectHelper.setEquality(itemsToSet(response.items), quotesList.getAttributeInstances(att))
    done()
  })
  .catch(done.fail)
}


function itemsToSet(items) {
  let result = new Set()
  items.forEach( i => result.add(i))
  return result
}