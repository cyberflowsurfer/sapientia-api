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
    getRequest(tableName)
    .then(response => {
      expectSetEquality(fixture.responseToIds(response), fixture.getAllIds())
      expectQuoteEquality(response.items)
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



})


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


function expectQuoteEquality(actual) {
  actual.forEach(a => {
    let expected = fixture.lookupByQuote(a.quote)
    expect(expected).toBeDefined("Lookup of expected quote failed")
    // Compare actual properties that exist against expected 
    fixture.getProperties().forEach( p => {
      if (actual[p])
        expect(actual[p]).toEqual(expected[p])
    })
  })
}


// Works around the problem that set equality is order sensitive: https://github.com/jasmine/jasmine/issues/1402
// Should be possible to create a customTester, but that doesn't seem to be working
//
function expectSetEquality(actual, expected) {
  let extraItems   = new Set( [...actual].filter(  x => !expected.has(x)) )
  let missingItems = new Set( [...expected].filter(x => !actual.has(x)) )
  expect(extraItems.size).toBe(0, `Response has extra items ${extraItems}`) 
  expect(missingItems.size).toBe(0, `Response missing items ${missingItems}`) 
}

function getRequest(tableName, id, queryParams) {
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
  return underTest(request, tableName)
}
