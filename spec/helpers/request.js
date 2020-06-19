'use strict'

module.exports.create = function(id, queryParams) {
  let request = {
    'pathParams': {},
    'queryString': {}
  }
  if (id) {
    request.pathParams.id = id
  }
  if (queryParams) {
    for (const p in queryParams) {
      request.queryString[p] = queryParams[p]
    }
  }
  return request
}