'use strict'

/**
 * Integration test for create-quote
 */
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const underTest    = require('../../handlers/get-quotes') 
const QuotesList   = require('../fixtures/quotesList') 
const quotesDB     = require('../helpers/quotesDB')
const create       = require('../helpers/create')
const request      = require('../helpers/request')
const expectHelper = require('../helpers/expect')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 


let quotesList    = new QuotesList()


describe('Get quote integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => {
    quotesDB.createTable(tableName)
    .then( () => create.createMany(tableName, quotesList.list(), done) ) 
  })


  afterAll( done => quotesDB.deleteTable(tableName, done) )


  it('Get all quotes', (done) => {
    getRequest(tableName)
    .then(response => {
      expectHelper.setEquality(quotesList.responseToIds(response), quotesList.getAllIds())
      expectHelper.quoteEquality(response.items, quotesList)
      done()
    })
    .catch(done.fail)
  })


  it('Get one quote', (done) => {
    getRequest(tableName)
    .then(response => {
      let id = response.items[1].id
      getRequest(tableName, id)
      .then(resp => {
        expect(resp.Item.id).toBe(id, `Fetch id ${id} received ${resp.id}`)
        done()
      })
    })
    .catch(done.fail)
  })


  it('Get limit 3', (done) => {
    getRequest(tableName, undefined, {'limit': 3})
    .then(response => {
      let itemCount = 0
      for (const i in response.items) {
        itemCount++
      }
      expect(itemCount).toBe(3, `Unexpected number of items returned`)
      expect(response.offset).toBeDefined()
      done()
    })
    .catch(done.fail)
  })

})


function getRequest(tableName, id, queryParams) {
  return underTest(request.create(id, queryParams), tableName)
}
