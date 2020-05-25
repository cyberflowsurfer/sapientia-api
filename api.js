'use strict'
//  REST API for managing quotations 
// 
const Builder   = require('claudia-api-builder')
const api       = new Builder()
const getQuotes = require('./handlers/get-quotes')

function rootHandler() {
    return {
      description: "Quotation management REST API",
      operations: [
        {
          verb: "GET",
          path: "/quotes",
          description: "Fetch one or all quotes "
        }
      ]

    }
  }


api.get('/', rootHandler)
api.get('/quotes', () => getQuotes()) 
api.get('/quotes/{id}', (req) => getQuotes(req.pathParams.id))

module.exports = api 