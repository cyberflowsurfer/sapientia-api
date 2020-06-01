#!/bin/bash
aws iam put-role-policy \
--role-name sapientia-api-executor \
--policy-name SapientiaApiDynamoDB \
--policy-document file://./roles/dynamodb.json
  