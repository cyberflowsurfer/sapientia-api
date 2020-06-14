'use strict'

/**
 * Integration test for create-quote
 */

const underTest = require('../../handlers/create-quote') 
const quotesDB  = require('../helpers/quotesDB')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 

describe('Create quote integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => quotesDB.createTable(tableName, done) )

  afterAll( done => quotesDB.deleteTable(tableName, done) )

  it('Create: new quote', (done) => {
    const request = {
      body: { author: "Grady Booch", quote: 'This additional code is so literate, so easy to read, that comments might even have gotten in the way', tags: ["computers"] }
    }
    createQuote(done, request, tableName)
  })

  it('Create: existing quote', (done) => {
    const request = {
      body: { author: "Grady Booch", quote: 'This additional code is so literate, so easy to read, that comments might even have gotten in the way', tags: ["computers"] }
    }
    createQuote(done, request, tableName)
    createQuote(done, request, tableName)
  })

  it('Create: Missing author', (done) => {
    const request = {
      body: { quote: 'This quote is missing an author' }
    }
    createQuoteError(done, request, tableName, 'Missing author')
  })

  it('Create: Missing quote', (done) => {
    const request = {
      body: { author: 'missing quote' }
    }
    createQuoteError(done, request, tableName, 'Missing quote')
  })
})


function createQuote(done, request, tableName) {
  underTest(request, tableName)
  .then(response => {
    quotesDB.getItem(tableName, response.id)
      .then(result => {
        expectQuote( result.Item, request.body, response.id )
        done()
      })
      .catch(done.fail)
  })
  .catch(done.fail)
}


function createQuoteError(done, request, tableName, errorMessage) {

  try {
    underTest(request, tableName)
    .then(response => {
      done()
    })
    .catch( error => {
      done.fail
    })
  } catch (error) {
    expect(error.message).toBe(errorMessage)
    done()
  }

}


function expectQuote(item, quote, responseId) {
  expect(item.id.S).toBe(responseId)
  expect(item.quote.S).toBe(quote.quote)
  expect(item.author.S).toBe(quote.author)  
}

