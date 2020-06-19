
'use strict'

/**
 * Integration test helpers
 */

const createQuote = require('../../handlers/create-quote') 


module.exports.createMany = function(tableName, quoteList, done) {
  let result = new Promise((resolve, reject) => {
    let promises = []
    quoteList.forEach( q =>  promises.push(createQuote( {'body': q.body}, tableName)))
    Promise.all(promises)
    .then (() => resolve())
    .catch(err => reject(err))
  })
  if (!done) 
    return result
  result.then(() => done()).catch(err => done.fail(err))
}
