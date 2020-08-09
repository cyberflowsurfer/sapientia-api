'use strict'

// Copyright (c) 2020 Seth G Hawthorne

/**
 * Integration test for get-quote based on random generated data
 */
require('dotenv').config()
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const QuotesList   = require('../helpers/quotesList') 
const create       = require('../helpers/create')
const request      = require('../helpers/request')
const expectHelper = require('../helpers/expect')
const test         = require('../helpers/test')

const underTest    = require('../../handlers/get-quotes') 
const quotesDB     = require('../../utils/quotesDB')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 


let quotesList    = new QuotesList('get-quote-spec', {count: 30})


describe('Get quote integration test', () => {
  const tableName = test.generateTableName() 

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
    testGetBy(done, tableName, {author: 'author-1'})
  })  

  it('Get filtered by publisher', (done) => {
    testGetBy(done, tableName, {publisher: 'publisher-2'})
  })

  it('Get filtered by author and source', (done) => {
    testGetBy(done, tableName, {author: 'author-1', publisher: 'publisher-2'})
  })

  it('Get filtered by single category', (done) => {
    testGetBy(done, tableName, {category: 'category-1'})
  })

  it('Get filtered by multiple categories', (done) => {
    testGetBy(done, tableName, {category: 'category-1 & category-2'})
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