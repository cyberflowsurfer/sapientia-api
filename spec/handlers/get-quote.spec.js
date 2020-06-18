'use strict'

/**
 * Integration test for create-quote
 */

const createQuote = require('../../handlers/create-quote') 
const underTest   = require('../../handlers/get-quotes') 
const QuotesList  = require('../fixtures/quotesList') 
const quotesDB    = require('../helpers/quotesDB')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 




let fixture    = new QuotesList()


describe('Get quote integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => {
    quotesDB.createTable(tableName)
    .then( () => createMany(tableName, fixture.list(), done) ) 
  })

  afterAll( done => quotesDB.deleteTable(tableName, done) )

  it('Get all quotes', (done) => {
    underTest(createRequest(), tableName)
    .then(response => {
      expectSetEquality(fixture.responseToIds(response), fixture.getAllIds())
      done()
    })
    .catch(done.fail)

    console.log('Done')
  })
})


function createRequest(id, queryParams) {
  let request = {
    'pathParams': {},
    'queryString': {}
  }
  if (id) {
    request.pathParams.id = id
  }
  if (queryParams) {
    request.queryString = queryParams
  }
  return request
}


function createMany(tableName, quoteList, done) {
  let result = new Promise((resolve, reject) => {
    let promises = []
    quoteList.forEach( q =>  promises.push(createQuote( {'body': q.request}, tableName)))
    Promise.all(promises)
    .then (() => resolve())
    .catch(err => reject(err))
  })
  if (!done) 
    return result
  result.then(() => done()).catch(err => done.fail(err))
}

// Works around the problem that set equality is order sensitive: https://github.com/jasmine/jasmine/issues/1402
// Should be possible to create a customTester, but that doesn't seem to be working
//
function expectSetEquality(actual, expected) {
  console.log(actual)
  console.log(expected)
  let extraItems   = new Set( [...actual].filter(  x => !expected.has(x)) )
  let missingItems = new Set( [...expected].filter(x => !actual.has(x)) )
  expect(extraItems.size).toBe(0, `Response has extra items ${extraItems}`) 
  expect(missingItems.size).toBe(0, `Response missing items ${missingItems}`) 
}

