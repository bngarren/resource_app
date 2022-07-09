#!/bin/bash

PATH_TO_PROJECT=~/dev/repos/resource_app
PATH_TO_OPENAPI_ROOT=./src/spec/openapi.yaml #unbundled
PATH_TO_OPENAPI_BUNDLED=./src/spec/openapi.bundled.yaml #bundled
PATH_TO_BACKEND_TYPES=./src/types/openapi.ts
PATH_TO_PRETTIERRC=./.prettierrc
PATH_TO_CLIENT_OPENAPI_CONFIG=./src/global/openapi/openapi-config.ts

echo
echo
echo "author: Ben Garren"
echo "last updated: 07/07/2022"
echo
echo "This script is going to use an OpenAPI spec ($PATH_TO_OPENAPI_ROOT) to generate backend types and frontend"
echo "RTK Query api and types. The former uses 'openapi-typescript' and the latter uses '@rtk-query/codegen-openapi'."
echo "Note: 'swagger-cli' must be installed in order to properly bundle the openAPI spec prior to running typescript conversions"
echo
echo

read -p "Continue? (y/n) " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo "--- swagger-cli bundling... ---"
echo
cd $PATH_TO_PROJECT && swagger-cli bundle $PATH_TO_OPENAPI_ROOT --outfile $PATH_TO_OPENAPI_BUNDLED --type yaml

echo
echo "--- Generating backend types ---"
echo
cd $PATH_TO_PROJECT && npx openapi-typescript $PATH_TO_OPENAPI_BUNDLED --output $PATH_TO_BACKEND_TYPES --support-array-length true --prettier-config $PATH_TO_PRETTIERRC
echo
echo "--- Generating client RTK Query api and types ---"
echo
cd $PATH_TO_PROJECT && cd src/client && npx @rtk-query/codegen-openapi $PATH_TO_CLIENT_OPENAPI_CONFIG
echo
echo
echo "Complete."
