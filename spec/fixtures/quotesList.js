'use strict'

module.exports = class QuotesList {

  constructor() {
      this.allIds      = undefined
      this.idsByAuthor = undefined
      this.idsByTag    = undefined
      this.quotesList  =   [
        {
          "id":  1,
          "body": {
              "author": "Author 1",
              "quote": "This is quote 1 by author 1",
              "source": "source 1",
              "when": "2020-06-18",
              "tags": [
                "odd", "first"
              ]
          }
        },
    
        {
          "id":  2,
          "body": {
            "author": "Author 1",
            "quote": "This is quote 2 by author 1",
            "source": "source 1",
            "when": "2020-06-18",
            "tags": [
              "even"
            ]
        }
        },
    
        {
          "id":  3,
          "body": {
            "author": "Author 1",
            "quote": "This is quote 3 by author 1",
            "source": "source 2",
            "when": "2019-02-30",
            "tags": [
              "odd"
            ]
        }
        },
    
        {
          "id": 4,
          "body": {
            "author": "Author 2",
            "quote": "This is quote 1 by author 2",
            "source": "source 3",
            "tags": [
              "even", "first"
            ]
          }
        },  
    
        {
          "id": 5,
          "body": {
            "author": "Author 2",
            "quote": "This is quote 2 by author 2",
            "source": "source 4",
            "tags": [
              "odd", 
            ]
          }
        },  
    
        {
          "id": 6,
          "body": {
            "author": "Author 3",
            "quote": "This is quote 1 by author 3",
            "tags": [
              "even", "first" 
            ]
          } 
        }  
      ]
  }


  getProperties() {
    return ['author', 'quote','subject', 'tags', 'when']
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


  getAttributeInstances(att) {
    let result = new Set()
    this.quotesList.forEach(q => {
      if (att == 'tags' && q.body.tags) {
        q.body.tags.forEach( t => result.add(t))
      } else {
        if (q.body[att]) {
          result.add(q.body[att])
       }
      }
    })
    return result
  }


  /**
   * Return the ids contained in the specified zero based page 
   */
  getIdsByPage(size, page) {
    let index = page * size
    if (index < this.quotesList.size) {
      return this.quotesList.slice(index, size)
    }
    return [] 
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


  lookupByQuote(quote) {
    let result = this.quotesList.find( e => quote == e.body.quote )
    if (result)
      return result.body
    return undefined
  }


  responseToIds(response) {
    let result = new Set()
    response.items.forEach( e => {
      // TODO: Replace linear search with hash lookup
      let q  = this.quotesList.find(i => i.body.quote == e.quote )
      if (q && q.id)
        result.add(q.id)
    })
    return result
  }
}

