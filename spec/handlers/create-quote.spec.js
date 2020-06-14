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

  it('Create a new quote', (done) => {
    const request = {
      body: { author: "Grady Booch", quote: 'This additional code is so literate, so easy to read, that comments might even have gotten in the way', tags: ["computers"] }
    }
    underTest(request, tableName)
      .then(response => {
        quotesDB.getItem(tableName, response.id)
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

