'use strict'
//  REST API for managing quotations 
// 
const Builder     = require('claudia-api-builder')
const api         = new Builder()

const createQuote = require('./handlers/create-quote')
const deleteQuote = require('./handlers/delete-quote')
const updateQuote = require('./handlers/update-quote')
const getQuotes   = require('./handlers/get-quotes')
const getAttributeValues = require('./handlers/get-attribute-values')


api.get('/', rootHandler)

api.post('/quotes', (request) => createQuote(request), {
    success: 200,
    error: 400
  }
)

api.get('/authors',        (request) => getAttributeValues(request, 'author')) 
api.get('/sources',        (request) => getAttributeValues(request, 'source')) 
api.get('/dates',          (request) => getAttributeValues(request, 'when')) 
api.get('/tags',           (request) => getAttributeValues(request, 'tags')) 

api.get('/quotes',         (request) => getQuotes(request)) 
api.get('/quotes/{id}',    (request) => getQuotes(request))

api.delete('/quotes/{id}', (request) => deleteQuote(request), {
    error: 400
  }
)

api.put('/quotes/{id}',    (request) => updateQuote(request), {
  error: 400
  }
)

function rootHandler() {
  return {
    description: "Quotation management REST API",
    operations: [
      {
        verb: "DELETE",
        path: "/quotes/{id}",
        description: "Delete a quote"
      },
      {
        verb: "GET",
        path: "/quotes",
        description: "Fetch all quotes"
      },
      {
        verb: "GET",
        path: "/quotes/{id}",
        description: "Fetch one specified quote"
      },
      {
        verb: "POST",
        path: "/quotes",
        description: "Create a quote"
      },
      {
        verb: "PUT",
        path: "/quotes/{id}",
        description: "Update a quote"
      }
    ]

  }
}

module.exports = api 