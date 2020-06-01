#!/bin/bash
# arn:aws:dynamodb:us-west-2:208650699318:table/quotes
aws dynamodb create-table --table-name quotes \
--attribute-definitions AttributeName=id,AttributeType=S AttributeName=quote,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH AttributeName=quote,KeyType=RANGE \
--provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
--region us-west-2 \
--query TableDescription.TableArn --output text
