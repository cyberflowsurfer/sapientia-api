'use strict'

const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { randomBytes } = require('crypto')

const test  = require('./test')
const utils = require('../../utils/utils')

const DEFAULT_TEST_DATA_FILE = './spec/fixtures/quotes.yaml'

module.exports = class QuotesList {

  /**
   * Creates a quotes list for testing 
   * @param {string} testName - the name of the test 
   * @param {Object} spec     - controls whether to use data from a file or to generate random data
   *                              * If the SAPIENTIA_TEST_FILE environment variable is defined data is read 
   *                                from that file 
   *                              * else if undefined read data from DEFAULT_TEST_DATA_FILE
   *                              * else generate test data
   */
  constructor(testName, spec) {
      this.allIds        = undefined
      this.idsByAuthor   = undefined
      this.idsByCategory = undefined
      this.testName      = testName

      spec             = spec || {}
      if (process.env.SAPIENTIA_TEST_FILE) {
        console.log(`Using process.env.SAPIENTIA_TEST_FILE ${process.env.SAPIENTIA_TEST_FILE}`)
        spec.fileName  = process.env.SAPIENTIA_TEST_FILE
      } else if (!spec.count) {
        spec.fileName  = DEFAULT_TEST_DATA_FILE
      }
      spec.count       = spec.count || 10

      this.initQuotesList(testName, spec)
  }


  getProperties() {
    return ['author', 'quote','publisher', 'category', 'publish_date']
  }


  getAllIds() {
      if (this.allIds) 
        return this.allIds

      this.allIds = new Set()
      this.quotesList.forEach(e => this.allIds.add(e.id))
      return this.allIds
  }


  getIdsByQuery(query) {
    let result

    for (const k in query) {
      let atts = []
      if (k == 'category') {
        // TODO: Currently only support and 
        atts = query[k].split('&')
      }
      else {
        atts.push(query[k])
      }
      for (const a of atts) {
        let v  = this.getIdsByAtt(k, a.trim())
        if (!result) {
          result = v
        } else {
          result = new Set([...result].filter(x => v.has(x))) // Intersection
        }

      }
    }
    return result
  }


  getIdsByAtt(att, value) {
    let result = new Set()
    this.quotesList.forEach(e => {
      if ((att === 'category' && e.body[att].includes(value)) || e.body[att] == value) {
        result.add(e.id)
      }
    })

    return result
  }


  getAttributeInstances(att) {
    let result = new Set()
    this.quotesList.forEach(q => {
      if (att == 'category' && q.body.category) {
        q.body.category.forEach( t => result.add(t))
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
   * Note: Quote database order is not guaranteed due to asyncronous insertion
   *       callers should therefore first fetch all quotes and specify the 
   *       the resulting list of ids as idList
   */
  getPageIds(page, size, idList) {
    if (idList) {
      idList = [...idList]
    } else {
      idList = []
      this.quotesList.forEach(e => idList.push(e.id))
    }

    let index  = page * size
    if (index < idList.length) {
      idList = idList.slice(index, size)
    }

    let result = new Set()
    idList.forEach(l => result.add(l))
    return result
  }


  getidsByCategory(category) {
    if (this.idsByCategory) {
      this.idsByCategory = new Set()
      this.quotesList.forEach(e => {
        if (e.category.includes(category) )
        this.idsByCategory.add(e.id)
      })
    }
    return this.idsByCategory
  }


  list() {
    return this.quotesList
  }


  /**
   * Initialize test data. 
   * 
   * @param {*} testName 
   * @param {*} spec 
   */
  initQuotesList(testName, spec) {
    if (spec.fileName) {
      // Read data from file (either fixture or saved from prior run)
      this.quotesList = utils.readDataSync(spec.fileName)
      if (!this.quotesList) {
        console.log(`Unrecognized file type: ${ext} ${spec.fileName}`)
      }
      console.log(`Using test data from: ${spec.fileName}`)
      if (spec.count && spec.count < this.quotesList.length) {
        this.quotesList = this.quotesList.slice(0, spec.size)
      }
    } else {
      // Generate test data 
      this.quotesList = this.generate(spec) 
      let fileName    = testFilename(testName)
      fs.writeFileSync(fileName, JSON.stringify(this.quotesList, undefined, 4))
      console.log(`Generating test data: ${fileName}`)      
    } 
    // console.log(JSON.stringify(this.quotesList, undefined, 4))
  }


  lookupByQuote(quote) {
    let result = this.quotesList.find( e => quote == e.body.content )
    if (result)
      return result.body
    return undefined
  }


  responseToIds(response) {
    let result = new Set()
    response.items.forEach( e => {
      // TODO: Replace linear search with hash lookup
      let q  = this.quotesList.find(i => i.body.content == e.content )
      if (q && q.id)
        result.add(q.id)
    })
    return result
  }


  /**
   * Generates a list of quotes based on the specified specification.
   * At minimum the specification must define the number of quotes. 
   * It can also specify the range over which random authors, subjects, and categories 
   * are generated. Values that are not specified are initialized to percentages of 
   * the total number of quotes. 
   * 
   * @param {Object} spec 
   */
  generate(spec) {
    function random(max) {
      return Math.floor(Math.random() * Math.floor(max))
    }

    function generateCategories(id) {
      let categories = []
      for (let i = random(spec.category); i > 0; i--) {
        categories.push(`category-${i}`)
      }
      categories.push((id % 2) ? 'even' : 'odd')
      return categories                             
    }

    function generateWhen(id) {
      let result = spec.start_date.toISOString();
      spec.start_date.setDate(spec.start_date.getDate() + 1) 
      return result 
    }
    
    function generateQuote(id) {
      return {
        id: id,
        body: {
          content:      `This is quote ${id}`,
          author:       `author-${random(spec.authors)}`,
          publisher:    `publisher-${random(spec.authors)}`,
          publish_date:  generateWhen(id),
          category:      generateCategories(id)
        }
      }
    }

    let result = []
    spec.count      = spec.count      || 10
    spec.authors    = spec.authors    || Math.floor(0.8 * spec.count)
    spec.publisher  = spec.publisher  || Math.floor(0.4 * spec.count) 
    spec.category   = spec.category   || Math.floor(0.3 * spec.count) 
    spec.start_date = new Date()
    spec.start_date.setDate(spec.start_date.getDate() - spec.count) 
    for (let i = 1; i <= spec.count; i++) {
      result.push(generateQuote(i, spec))
    }
    return result 
  }

}


function testFilename(testName) {
  return path.join(__dirname, '..', 'runs', `${test.testRunName(testName)}`)
}