
'use strict'

module.exports.generateTableName = function(testName) {
  return `quotesTest-${testRunName(testName)}` 
} 


function testRunName(testName) {
  const now       = new Date();
  const offsetMs  = now.getTimezoneOffset() * 60 * 1000;
  const dateLocal = new Date(now.getTime() - offsetMs);
  const str       = dateLocal.toISOString().replace(/:/g, "-").replace(/\./g, "-").replace(/Z/g, "").replace(/T/g, "_")
  return (testName) ? `${testName}_${str}` : str
}

module.exports.testRunName = testRunName

