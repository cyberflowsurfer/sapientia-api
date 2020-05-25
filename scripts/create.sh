#!/bin/bash
# Create Caludia.js (https://claudiajs.com/) API application
pushd $(dirname $0)/.. >> /dev/null
  claudia create --region us-west-2 --api-module api 
popd 
