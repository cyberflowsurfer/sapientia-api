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


let quotesList    = new QuotesList('get-quote-spec', {count: 20})


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
    // Insertion order is not guaranteed so we first have to get all quotes
    getRequest(tableName)
    .then(response => {
      let allIds = quotesList.responseToIds(response)

        let limit = 3
        getRequest(tableName, undefined, {'limit': limit})
        .then(response => {
          let itemCount = Object.keys(response.items).length
    
          expect(itemCount).toBe(limit, `Unexpected number of items returned`)  
          expectHelper.setEquality(quotesList.responseToIds(response), quotesList.getPageIds(0, limit, allIds))
          expect(response.offset).toBeDefined()
          console.log(JSON.stringify(response))
          // TODO: Fetch next page
          done()
        })
        .catch(done.fail)

    })
  })


  it('Get filtered by author', (done) => {
    testGetBy(done, tableName, 'author', 'author 1')
  })

  
  it('Get filtered by source', (done) => {
    testGetBy(done, tableName, 'source', 'source 2')
  })

  it('Get filtered by tag', (done) => {
    testGetBy(done, tableName, 'tag', 'tag 1')
  })

})


function getRequest(tableName, id, queryParams) {
  return underTest(request.create(id, queryParams), tableName)
}


function testGetBy(done, tableName, att, value) {
  getRequest(tableName, undefined, {'filter': `${att}=${value}`})
  .then(response => {
    expectHelper.setEquality(quotesList.responseToIds(response), quotesList.getIdsByAtt(att, value))
    done()
  })
  .catch( err => done.fail(err))
}