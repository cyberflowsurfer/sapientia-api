'use strict'

module.exports = class QuotesList {

  constructor() {
      this.allIds      = undefined
      this.idsByAuthor = undefined
      this.idsByTag    = undefined
      this.quotesList  =   [
        {
          "id":  1,
          "request": {
              "author": "Author 1",
              "quote": "This is quote 1 by author 1",
              "tags": [
                "odd", "first"
              ]
          }
        },
    
        {
          "id":  2,
          "request": {
            "author": "Author 1",
            "quote": "This is quote 2 by author 1",
            "tags": [
              "even"
            ]
        }
        },
    
        {
          "id":  3,
          "request": {
            "author": "Author 1",
            "quote": "This is quote 3 by author 1",
            "tags": [
              "odd"
            ]
        }
        },
    
        {
          "id": 4,
          "request": {
            "author": "Author 2",
            "quote": "This is quote 1 by author 2",
            "tags": [
              "even", "first"
            ]
          }
        },  
    
        {
          "id": 5,
          "request": {
            "author": "Author 2",
            "quote": "This is quote 2 by author 2",
            "tags": [
              "odd", 
            ]
          }
        },  
    
        {
          "id": 6,
          "request": {
            "author": "Author 3",
            "quote": "This is quote 1 by author 3",
            "tags": [
              "even", "first" 
            ]
          } 
        }  
      ]
  }


  getAllIds() {
      if (this.allIds) 
        return this.allIds

      this.allIds = new Set()
      this.quotesList.forEach(e => this.allIds.add(e.id))
      return this.allIds
  }


  getIdsByAuthor(author) {
    if (!this.idsByAuthor) {
      this.idsByAuthor = new Set()
      this.quotesList.forEach(e => {
        if (e.author == author) 
        this.idsByAuthor.add(e.id)
      })
    }
    return this.idsByAuthor
  }


  getIdsByTag(tag) {
    if (this.idsByTag) {
      this.idsByTag = new Set()
      this.quotesList.forEach(e => {
        if (e.tags.includes(tag) )
        this.idsByTag.add(e.id)
      })
    }
    return this.idsByTag
  }


  list() {
    return this.quotesList
  }


  responseToIds(response) {
    let result = new Set()
    response.items.forEach( e => {
      // TODO: Replace linear search with hash lookup
      let q  = this.quotesList.find(i => i.request.quote == e.quote )
      if (q && q.id)
        result.add(q.id)
    })
    return result
  }
}

