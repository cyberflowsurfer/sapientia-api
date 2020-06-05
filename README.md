# sapientia-api
Simple AWS Lambda/API Gateway/DynamoDb based REST API for managing quotations. Claudia.js is used for deployment and API gateway interface. 

# Deployment
## First Time
  1. scripts/create.sh
  1. scripts/create-policy.sh
  1. scripts/create-table.sh

## Update
  1. scripts/update.sh


# Endpoints
  * / - List endpoints

  * GET /quotes 
    * [ limit = count]
    * [ offset = offset]

  * PUT /quotes

  * GET /authors - List all quote authors
  * GET /dates   - List all quote dates
  * GET /sources - List all quote sources
  * GET /tags    - List all quote tags

  


