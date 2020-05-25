/**
 * GET quotes request handler 
 */
const quotes = require('../data/quotes.json')

function getQuotes(id) {
  if (!id) {
    return quotes
  }

  const quote = quotes.find((quote) => quote.id == id)
  if (quote)
    return quote
  else
    throw new Error(`Quote not found: ${id}`)
}

module.exports = getQuotes