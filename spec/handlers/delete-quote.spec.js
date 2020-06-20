'use strict'

/**
 * Integration test for create-quote
 */
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION || 'us-west-2'});

const deleteQuote  = require('../../handlers/delete-quote') 
const getQuote     = require('../../handlers/get-quotes') 
const QuotesList   = require('../fixtures/quotesList') 
const quotesDB     = require('../helpers/quotesDB')
const create       = require('../helpers/create')
const request      = require('../helpers/request')
const expectHelper = require('../helpers/expect')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 


let quotesList    = new QuotesList()


describe('Delete quote integration test', () => {
  const tableName = quotesDB.generateTableName() 

  beforeAll( done => {
    quotesDB.createTable(tableName)
    .then( () => create.createMany(tableName, quotesList.list(), done) ) 
  })


  afterAll( done => quotesDB.deleteTable(tableName, done) )


  it('Delete existing quote', (done) => {
    getQuote(request.create(), tableName)
    .then(response => {
      let id = response.items[0].id
      deleteQuote(tableName, id)
      .then (response => {
        console.log(JSON.stringify(response))
      })
      done()
    })
    .catch(done.fail)
  })

  
  // TODO: Would be nice to suppress the unhandled promise rejection warning
  it('Delete non-existent quote', (done) => {
      deleteQuote(tableName, "4242")
      .then (response => {
        done.fail()
      })
      .catch(err => {
        expect(err.message).toBe("Requested resource not found")
        done()
      })

    })
})

