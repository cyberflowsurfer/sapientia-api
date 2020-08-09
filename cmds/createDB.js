'use strict'

/**
 * Utility for creating the database table 
 */
const quotesDB = require('../utils/quotesDB')
require('dotenv').config()
const AWS      = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})


;(async () => {
  const tableName = quotesDB.tableName()
  quotesDB.createTable(tableName)
  .then(console.log(`Created datatabase table: ${tableName}`))
})()