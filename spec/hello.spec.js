'use strict'

const quotes = [
  {
    "id": 1,
    "author": "Grady Booch",
    "quote": "This code is so literate, so easy to read, that comments might even have gotten in the way",
    "tags": [
      "computers", "programming"
    ]
  },

  {
    "id": 2,
    "author": "Unknown",
    "quote": "A goal without a deadline is merely a dream",
    "tags": [
      "motivation"
    ]
  }
]

function getQuotes(id) {
  if (id === undefined)
    return quotes
  else 
    return quotes.find(e => e.id == id)
}


describe('Simple test', () => { 
  it('should return a list of all quotes when called without an ID', () => { 
    expect(getQuotes()).toEqual(quotes) 
  })

  it('should return a single quote if the existing ID is passed as a first parameter', () => { // <6>
    expect(getQuotes(1)).toEqual(quotes[0])
    expect(getQuotes(2)).toEqual(quotes[1])
  })

})
