# Project root

## npm scripts
- `"dev": "clear && npm run migrate-latest && npm run seed && ts-node-dev --respawn --ignore-watch ./src/client --transpile-only ./src/main.ts | npx pino-pretty"`
   - First runs the knex migration to get the database schema up to date. If this errors, may need to rollback and then try to migrate up again
   - Also runs knex seed files (notably, this seeds our 'users' table with testuser@gmail.com)
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
- `"start": "npm run migrate-latest && npm run seed && npm run build && node dist/main.js | npx pino-pretty"`
   - To start a local server we migrate the database, seed it, and then run "build" to perform the TS transpilation. We pipe the output of the node process to pino-pretty which prettifies the pino logging to the console
- `"migrate-latest": "knex migrate:latest --knexfile src/knexfile.ts"`
   - Runs any new (unrun) up migrations
- `"migrate-rollback": "knex migrate:rollback --all --knexfile src/knexfile.ts"`
   - Rolls back all migrations
- `"migrate-refresh": "npm run migrate-rollback && npm run migrate-latest"`
   - Rolls back and re-migrates in one command, good for dev environment after a migration schema change
- `"seed": "knex seed:run --knexfile src/knexfile.ts"`
   - Seeds the database

## custom sh scripts
> updated: 2022-07-09
- `generateTypes.sh`
   - This script uses an OpenAPI spec to generate backend types and frontend RTK Query api and types. The former uses 'openapi-typescript' and the latter uses '@rtk-query/codegen-openapi'. It also uses a globally installed 'swagger-cli' to bundle the yaml spec prior to running.
   - File paths are defined within the script
   - It should point to a _bundled_ OpenAPI spec; we have a "openapi.bundled.yaml" file in "./src/spec" that is produced by this script using swagger-cli

## Project root files
- **Procfile** - this is a file that Heroku uses to know how to start our app. It points to our entry point, i.e. dist/main.js
   - It also defines a release process which is run after the build is complete and can be used to run database migration
- **tsconfig.json** - 
- **tsconfig.build.json** - extends the actual tsconfig.json but customizes it slightly. Primarily, it excludes transpiling the /tests folder, which doesn't need to go to /dist
- **.env** - Stores environment variables. This file *is not version controlled (it in .gitignore)*.

# Project architecture

## OpenApi
> updated: 2022-07-09
- We are using OpenAPI to define our API's endpoints, operations on each endpoint, and schema for requests and responses to/from the API.
   - See https://swagger.io/docs/specification/about/
- Our API specification is now the **source of truth** for our backend (how each route should ultimately be handled) and frontend (how RTK query should make requests and receive responses in a typesafe way).
- We also use **Swagger** which is a set of tools built around OpenAPI. ~~Currently we are building the OpenApi spec on Swagger Hub and syncing this through GitHub to a `swaggerhub` branch which we can then merge with our develop branch to get the latest API specs.~~
- Typescript types can be automatically generated using CLI's from our OpenAPI spec for both backend and frontent (see below)

### Swagger/OpenAPI workflow
> updated: 2022-07-09
   - ~~Use SwaggerHub to edit our API specification. This includes all endpoints, parameters, request bodies, responses, and HTTP error codes that the API should receive/send~~
   - ~~This will automatically sync (push to `swaggerhub` branch) a new openapi.json definition (`/src/openapi.json`)~~
   - ~~This branch can then be merged with `develop` to get this fresh API spec~~
#### UPDATED
   - Now using VScode to edit openapi yaml files directly. This allows quicker editing and dividing into multiple files.
      - To accomplish this, we have OpenAPI Editor _extension_ installed for VS code
      - We have placed the openiapi files in the **./src/spec** directory
      - There is a "root" file called openapi.yaml
      - It can reference other files
      - Multiple yaml files are bundled into a single spec using swagger-cli (installed globally, but we do this in our generateTypes.sh script). See https://github.com/drwpow/openapi-typescript/issues/771#issuecomment-996914958
      - We run our generateTypes.sh script which points to the bundled "openapi.bundled.yaml" file
   - On the **backend** side, we can use the OpenAPI spec and a run `"npx openapi-typescript openapi.json --output ./types/openapi.ts --support-array-length true --prettier-config ../.prettierrc"` to generate the types for our backend
      - See https://www.npmjs.com/package/openapi-typescript
      - This is _included_ in our generateTypes.sh script
   - We also have a non-generated **"openapi.extended.ts"** that includes helper functions and types associated with the generated types, e.g. to correctly type Express req/res and Errors based on our openapi types
   - **_IMPORTANT_**: These types are specific to the **API** side of the backend, i.e. HTTP requests and responses, not the _**model/database**_ side. So we still use an Objection Model with it's own jsonSchema to represent the database model, which is very similar and sometimes the same as the API types, but are intentionally duplicated in code and must be kept updated together.
   - From a **client** standpoint, we can use the command `"npx @rtk-query/codegen-openapi openapi-config.ts"` within the /src directory to generate a new RTKQ API file based on the backend/API's openapi.json file.
      - This codegen uses a config file, currently /src/openapi/openapi-config.ts, to determine which schema to use, which base API (skeleton createAPI from RTKQ) to build on, and where to output the generated file
      - Ultimately this creates a openAPIGenerated.ts file, which is an RTKQ api (essentially an RTK slice that can be use in store)
      - It also exports type definitions used in any schema
      - This is _included_ in our generateTypes.sh script
   - Lastly from a client standpoint, we edit our appSlice.ts file which "enhances" the api by adding tags (ie caching invalidation), and exports our custom hooks (see RTKQ website for the naming convention)
   - Now our client should have a fully typed RTK queries/mutations that hit our API endpoints with typed requests and responses based on our source of truth (OpenAPI spec)
   - **WORKFLOW**: I've made a /scripts folder at the project root that has a `generateTypes.sh` that will run the above openapi-typescript and @rtk-query/codegen-openapi CLI's to make this workflow faster.

## ORM, validation, and type safety
- We are using **Objection.js** as our ORM (built on top of **Knex** query builder)
- An Objection model (e.g. ResourceModel) defines the properties of the database row and provides a jsonSchema to validate the model data before any insert/update operation
- To pass a non-model version of the item around, we use a type derived from the model object: `export type ResourceType = ModelObject<ResourceModel>`, which contains all the properties defined in the model
- This typing is **distinct** from the API typings derived from OpenAPI spec (see above) that is used with our REST endpoints.

## RTK Query
> 2022-07-09
- For the client we are currently using Redux RTK and its associated RTK query for client side fetching, status/error handling, and caching.
- RTK Query likes to have API endpoints declared up front, thus it plays nicely with us starting with an OpenAPI spec and using [RTK's own codegen](https://redux-toolkit.js.org/rtk-query/usage/code-generation#openapi) to generate the API.
- See our [OpenAPI workflow](#swaggeropenapi-workflow) above to reference how we generate types

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

## Managing firebase users in development
> 2022-07-23
- It is easy for our Firebase auth users to get out of sync with our app's database (i.e. 'users' table). This is because we regularly rollback and redo migrations during development which deletes the users from our database, but they would still exist in firebase. Can't just sign up again because they already exist. 
   - **Current solution**: Always use the "testuser@gmail.com" user when developing. This user should remain in firebase. And we can re-seed this user in our database by running `npx knex seed:run`, which includes a 'seed_users.ts' seed. We should automatically reseed with the npm run dev command for local development and in the heroku procfile for production.

## JWT
- Prounounced "jot"
- ID tokens are what the modern client SDKs actually use to authenticate end users
- ID tokens are short-lived JWTs, lasting for just one hour.
- Firebase will refresh a user’s ID token on your behalf using a refresh token
   - When you authenticate, FB generates an ID token / refresh token pair and every hour continues to refresh the ID token on our behalf
- To securely access our app's API endpoints, we will send our ID token within the HTTP request header

# Error handling
> 2022-07-10
## Backend error handling
- **API errors** (HTTP related errors dealing with Express, requests, responses, etc.) should be created in the **Controller** via next() function and use a typed error if possible, which is based on our helper function newTypedHttpError which provides typing of the error based on the OpenApi spec. API errors should ultimately be handled by the **errorHandler middleware**.
- Errors occuring in the Data Access Layer (e.g. queryResource, queryUser, etc.) should throw out to the calling **Service** layer.
   - Always use 'return await' to keep the async function in the call stack. See https://stackoverflow.com/a/44806230
- The Service layer uses a helper `handleDatabaseError()` to filter the error, and then returns it.
- Thus, a caller of a Service layer function should expect the Result | Error
```javascript
// queryUser.ts "Data Access Layer"
export const addUser = async (model: UserModel, trx?: TransactionOrKnex) => {
  // Keeps thrown Error in the call stack
  return await query_addUser(model, trx);
}
```
```javascript
// userService.ts "Service Layer"
// ...
try {
    // Validate json schema for the model
    inputUserModel = UserModel.fromJson(modifiedUserJson);
    // perform query
    const resultUser = await addUser(inputUserModel, trx);
    // If result could be undefined, may need another check and possibly return Error here as well...
    // Here, addUser either returns the User or throws
    return resultUser;
  } catch (error) {
    // Includes all database/query errors
    // Filter/transform the error and return it
    if (error instanceof Error) return handleDatabaseError(error);
    // shouldn't need, but for type safety
    return new Error(String(error));
  };
```

# Resolved problems
## Corrupted Knex migrations directory
- Try to rollback all completed migrations with `knex migrate:rollback --all`
- If that doesn't work, delete the knex_migrations table and other tables
- Run `knex migrate:latest`

## Jest running tests twice
- Had this problem because Jest was also running tests found in /dist directory. Somehow some .ts tests had been transpiled to .js files in the /dist directory, although we shouldn't do this based on the tsconfig.build.json
- Either way, I have now added a `testPathIgnorePatterns: [".d.ts", ".js"]` line to the jest.config.ts file which now ignores any .js files (we only test .ts files in our app currently)

# App Health Checklist
> 2022-07-10
- Verify that the OpenAPI spec and the generated types from it are congruent with the backend model/types. Similarly, client/frontend types should derive from RTK query (the only way we should be interfacing with our API), which derives from our OpenAPI spec.
- Test coverage
   - Tests in `api.test.ts` should test each endpoint for the correct status code and, if appropriate, response body based on the OpenAPI spec


# WIP 

