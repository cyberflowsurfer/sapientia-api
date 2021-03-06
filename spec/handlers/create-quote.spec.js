'use strict'

/**
 * Integration test for create-quote
 */

const underTest = require('../../handlers/create-quote') 
const quotesDB  = require('../helpers/quotesDB')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 

let quote_min  = { author: "author-m",  quote: 'quote min attributes' }
let quote_full = { author: "author-f", quote: 'quote full attributes', source: 'source-f', source_url: 'http://example.com', image_url: 'http://example.com', tags: ["tag 1", "tag 2"], when: "2020-06-28" }

describe('Create quote integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => quotesDB.createTable(tableName, done) )
  afterAll( done => quotesDB.deleteTable(tableName, done) )

  it('Create: new quote (minimal)', (done) => {
    createQuote(tableName, { body: quote_min }, done)
  })

  it('Create: new minimal quote (full)', (done) => {
    createQuote(tableName, { body: quote_full }, done)
  })

  it('Create: existing quote', (done) => {
    const request = { body: quote_min }
    createQuote(tableName, request).then(() => createQuote(tableName, request, done))
  })

  it('Create: Missing author', (done) => {
    const request = {
      body: { quote: 'This quote is missing an author' }
    }
    createQuoteError(tableName, request, 'Missing author', done)
  })

  it('Create: Missing quote', (done) => {
    const request = {
      body: { author: 'missing quote' }
    }
    createQuoteError(tableName, request, 'Missing quote', done)
  })

  it('Create: Extra attribute', (done) => {
    const request = {
      body: { extra: "extra attribute", author: "Grady Booch", quote: 'This additional code is so literate, so easy to read, that comments might even have gotten in the way', tags: ["computers"] }
    }
    createQuoteError(tableName, request, 'Extra attribute: extra', done)
  })
})


function createQuote(tableName, request, done) {
  var promise = new Promise((resolve, reject) => {
    underTest(request, tableName)
    .then(response => {
      quotesDB.getItem(tableName, response.id)
        .then(result => {
          console.log(JSON.stringify(result))
          expectQuote( result.Item, request.body, response.id )
          resolve(response)
        })
        .catch(err => reject(err))
    })
    .catch(err => reject(err))
  })
  if (!done) 
    return promise
  promise.then(() => done()).catch(err => done.fail(err))
}


function createQuoteError(tableName, request, errorMessage, done) {
  var promise = new Promise((resolve, reject) => {
    try {
      underTest(request, tableName)
      .then(response => resolve(response))
      .catch( err => reject(error))
    } catch (err) {
      expect(err.message).toBe(errorMessage)
      resolve()
    }
  })
  if (!done) 
    return promise
  promise.then(() => done()).catch(err => done.fail(err))
}


function expectQuote(item, quote, responseId) {
  expect(item.id.S).toBe(responseId)
  expect(item.quote.S).toBe(quote.quote)
  expect(item.author.S).toBe(quote.author)  
}

