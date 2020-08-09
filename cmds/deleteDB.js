'use strict'

/**
 * Utility for deleting  the database table 
 */
require('dotenv').config()
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})

const Confirm  = require('prompt-confirm')
const quotesDB = require('../utils/quotesDB')


;(async () => {
  const tableName = quotesDB.tableName()
  const prompt = new Confirm(`Are you sure you want to delete table: ${tableName} (yes/no)?`)
  .ask( answer => {
    if (answer.toLowerCase() === 'yes'){
      quotesDB.deleteTable(tableName)
      .then(console.log(`Deleted datatabase table: ${tableName}`))
    } else {
      console.log('aborted')
    }
  })

})()