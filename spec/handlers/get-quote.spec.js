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
        expect(resp.Items[0].id).toBe(id, `Fetch id ${id} received ${resp.id}`)
        expect(resp.Items.length).toBe(1, `Expected single item`)
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
          expect(response.items.length).toBe(limit, `Unexpected number of items returned`)  
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
    testGetBy(done, tableName, {author: 'author 1'})
  })  

  it('Get filtered by source', (done) => {
    testGetBy(done, tableName, {source: 'source 2'})
  })

  it('Get filtered by author and source', (done) => {
    testGetBy(done, tableName, {author: 'author 1', source: 'source 2'})
  })

  it('Get filtered by single tag', (done) => {
    testGetBy(done, tableName, {tags: 'tag 1'})
  })

  it('Get filtered by multiple tags', (done) => {
    testGetBy(done, tableName, {tags: 'tag 1 & tag 2'})
  })

})


function getRequest(tableName, id, queryParams) {
  return underTest(request.create(id, queryParams), tableName)
}


function testGetBy(done, tableName, query) {
  getRequest(tableName, undefined, query)
  .then(response => {
    expectHelper.setEquality(quotesList.responseToIds(response), quotesList.getIdsByQuery(query))
    done()
  })
  .catch( err => done.fail(err))
}