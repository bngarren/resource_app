# Project root

## npm scripts
- `"dev": "clear && npm run migrate-latest && ts-node-dev --respawn --ignore-watch ./src/client --transpile-only ./src/main.ts | npx pino-pretty"`
   - First runs the knex migration to get the database schema up to date. If this errors, may need to rollback and then try to migrate up again
   - Restarts target process (main.ts) each time it sees file changes and uses ts-node to compile to Typescript between each run. Similar to running nodemon with ts-node
   - `--ignore-watch ./src/client` tells it not to watch/restart on changes within client directory
- `"test": "LOGGER_LEVEL=fatal jest --runInBand"`
   - We use the "--runInBand" flag to make jest run tests serially rather than in parallel (default) so that we don't have conflicts with multiple tests trying to operate on the test database at the same time
   - We set the LOGGER_LEVEL env variable to fatal to suppress any logs lower than this level during tests (complicates the output)
- `"test:error": "LOGGER_LEVEL=error jest --runInBand"`
   - Same as above but runs with log level of "error" to show errors
- `"test:debugger": "LOGGER_LEVEL=fatal node --inspect-brk node_modules/.bin/jest --runInBand"`
   - Runs jest in debug mode. Once this is run, go to chrome://inspect and open the target. Can then step through each test
- `"build": "rm -rf dist && tsc -p ./tsconfig.build.json"`
   - Uses the typescript compiler to transpile all of our .ts files to javascript. We first remove the old dist (prior build). When building for production we use a separate tsconfig file that excludes the tests folder.
   - Since we are currently using Heroku, we don't even use this build command for "production"
- `"heroku-postbuild": "echo heroku-postbuild"`
   - Heroku uses this script instead of "build". Our heroku deployment has a buildpack that manages the typescript transpiling and dependencies for us
   - We just echo here so that our other build script doesn't also run
   - We accomplish database migrations in the release phase (see Procfile)
- `"deploy": "git push heroku master"`
   - Our custom deploy script just pushes our master branch to the heroku remote which triggers a new deploy/build
- `"start": "npm run migrate-latest && npm run build && node dist/main.js | npx pino-pretty"`
   - To start a local server we migrate the database, and then run "build" to perform the TS transpilation. We pipe the output of the node process to pino-pretty which prettifies the pino logging to the console
- `"migrate-latest": "knex migrate:latest --knexfile src/knexfile.ts"`
   - Runs any new (unrun) up migrations
- `"migrate-rollback": "knex migrate:rollback --all --knexfile src/knexfile.ts"`
   - Rolls back all migrations
- `"seed": "knex seed:run --knexfile src/knexfile.ts"`
   - Seeds the database

## custom sh scripts
> updated: 2022-07-07
- `generateTypes.sh`
   - This script uses an OpenAPI spec to generate backend types and frontend RTK Query api and types. The former uses 'openapi-typescript' and the latter uses '@rtk-query/codegen-openapi'.
   - File paths are defined within the script

## Project root files
- **Procfile** - this is a file that Heroku uses to know how to start our app. It points to our entry point, i.e. dist/main.js
   - It also defines a release process which is run after the build is complete and can be used to run database migration
- **tsconfig.json** - 
- **tsconfig.build.json** - extends the actual tsconfig.json but customizes it slightly. Primarily, it excludes transpiling the /tests folder, which doesn't need to go to /dist
- **.env** - Stores environment variables. This file *is not version controlled (it in .gitignore)*.

# Project architecture

## OpenApi
> updated: 2022-07-07
- We are using OpenAPI to define our API's endpoints, operations on each endpoint, and schema for requests and responses to/from the API.
   - See https://swagger.io/docs/specification/about/
- Our API specification is now the **source of truth** for our backend (how each route should ultimately be handled) and frontend (how RTK query should make requests and receive responses in a typesafe way).
- We also use **Swagger** which is a set of tools built around OpenAPI. Currently we are building the OpenApi spec on Swagger Hub and syncing this through GitHub to a `swaggerhub` branch which we can then merge with our develop branch to get the latest API specs.
- Typescript types can be automatically generated using CLI's from our OpenAPI spec for both backend and frontent (see below)

### Swagger/OpenAPI workflow
> updated: 2022-07-07
   - Use SwaggerHub to edit our API specification. This includes all endpoints, parameters, request bodies, responses, and HTTP error codes that the API should receive/send
   - This will automatically sync (push to `swaggerhub` branch) a new openapi.json definition (`/src/openapi.json`)
   - This branch can then be merged with `develop` to get this fresh API spec
   - On the **backend** side, we can use the OpenAPI spec and a run `"npx openapi-typescript openapi.json --output ./types/openapi.ts --support-array-length true --prettier-config ../.prettierrc"` to generate the types for our backend
      - See https://www.npmjs.com/package/openapi-typescript
   - **_IMPORTANT_**: These types are specific to the **API** side of the backend, i.e. HTTP requests and responses, not the _**model/database**_ side. So we still use an Objection Model with it's own jsonSchema to represent the database model, which is very similar and sometimes the same as the API types, but are intentionally duplicated in code and must be kept updated together.
   - From a **client** standpoint, we can use the command `"npx @rtk-query/codegen-openapi openapi-config.ts"` within the /src directory to generate a new RTKQ API file based on the backend/API's openapi.json file.
      - This codegen uses a config file, currently /src/openapi/openapi-config.ts, to determine which schema to use, which base API (skeleton createAPI from RTKQ) to build on, and where to output the generated file
      - Ultimately this creates a openAPIGenerated.ts file, which is an RTKQ api (essentially an RTK slice that can be use in store)
      - It also exports type definitions used in any schema
   - Lastly from a client standpoint, we edit our appSlice.ts file which "enhances" the api by adding tags (ie caching invalidation), and exports our custom hooks (see RTKQ website for the naming convention)
   - Now our client should have a fully typed RTK queries/mutations that hit our API endpoints with typed requests and responses based on our source of truth (OpenAPI spec)
   - **WORKFLOW**: I've made a /scripts folder at the project root that has a `generateTypes.sh` that will run the above openapi-typescript and @rtk-query/codegen-openapi CLI's to make this workflow faster.

## ORM, validation, and type safety
- We are using **Objection.js** as our ORM (built on top of **Knex** query builder)
- An Objection model (e.g. ResourceModel) defines the properties of the database row and provides a jsonSchema to validate the model data before any insert/update operation
- To pass a non-model version of the item around, we use a type derived from the model object: `export type ResourceType = ModelObject<ResourceModel>`, which contains all the properties defined in the model
- This typing is **distinct** from the API typings derived from OpenAPI spec (see above) that is used with our REST endpoints.

# Heroku deployment
## Config vars
- These are Heroku's environment variables
- **DATABASE_URL** - specifies the connection string to the postgresql database (also on Heroku). We don't copy the string and use it elsewhere because it can change
- **NPM_CONFIG_PRODUCTION** - we set this to false so that we skip pruning the devDependencies. This is necessary so that the typescript buildpack has access to these (i.e., typescript and types are dev dependencies)
- **TSC_CONFIG** - this tells the typescript buildpack which tsconfig file to use. Similar to our npm scripts, we want to use a custom tsconfig.build.json; therefore this lets Heroku do the same thing

## Buildpacks
- Buildpacks run scripts to help transform the code into a "slug" that can then run on a Heroku dyno
- **heroku/nodejs** buildpack - sets up a node environment, uses npm to install dependencies, runs npm scripts
- **zidizei/typescript** - compiles our typescript

# Logging
## Pino
- The base pino logger is instantiated in /logger and can be customized here
- Through the code we can simply `import { logger }` and then use `logger.info` or `logger.warn` for example
   - The default logging methods are trace, debug, info, warn, error, and fatal
- To log objects, use string formatting (printf style) See [here](https://github.com/pinojs/pino/blob/HEAD/docs/api.md#message-string)
- The **log level** (threshold at which logs are displayed) comes from config file, which tries to pull from .env variable. Thus log level can be set from environment or command line `LOGGER_LEVEL=debug`
- For logging Express (i.e. requests/responses), we use express-pino-logger module. We create this middleware in /middleware and then apply it in server.ts with `app.use()`. We can customize the output and stuff as well

# Firebase authentication

- There is a client firebase implementation (for the user to sign up/login/sign out) with the Firebase server and receive ID tokens back to signify the authentication
- There is a server firebase implementation (Admin SDK) which we use to verify the ID token sent within an HTTP request to one of the endpoints. This ensures that we know/trust/allow the client to access our endpoint
- We are using a custom middleware `firebaseAuthentication.ts` that reads each request coming in to see if it contains an Authorization header in the "Bearer" pattern, meaning an authenticated request should have a valid JWT token in the header. Our backend uses firebase admin sdk to verify this token and allow the request to proceed to the handlers.

## JWT
- Prounounced "jot"
- ID tokens are what the modern client SDKs actually use to authenticate end users
- ID tokens are short-lived JWTs, lasting for just one hour.
- Firebase will refresh a user’s ID token on your behalf using a refresh token
   - When you authenticate, FB generates an ID token / refresh token pair and every hour continues to refresh the ID token on our behalf
- To securely access our app's API endpoints, we will send our ID token within the HTTP request header

# App Health Checklist
> 2022-07-06
- Verify that the OpenAPI spec and the generated types from it are congruent with the backend model/types. Similarly, client/frontend types should derive from RTK query (the only way we should be interfacing with our API), which derives from our OpenAPI spec.


# Current WIP 
## 2022-07-06
- Working on OpenApi spec for backend, using SwaggerHub and then RTK query codegen to make the api with typescript types