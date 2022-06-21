# Project root

## npm scripts
- `"dev": "ts-node-dev --respawn --transpile-only ./src/main.ts | npx pino-pretty"`
   - Restarts target process (main.ts) each time it sees file changes and uses ts-node to compile to Typescript between each run. Similar to running nodemon with ts-node
- `"test": "LOGGER_LEVEL=fatal jest --runInBand"`
   - We use the "--runInBand" flag to make jest run tests serially rather than in parallel (default) so that we don't have conflicts with multiple tests trying to operate on the test database at the same time
   - We set the LOGGER_LEVEL env variable to fatal to suppress any logs lower than this level during tests (complicates the output)
- `"test:debug": "LOGGER_LEVEL=fatal node --inspect-brk node_modules/.bin/jest --runInBand"`
   - Runs jest in debug mode. Once this is run, go to chrome://inspect and open the target. Can then step through each test
- `"build": "rm -rf dist && tsc -p ./tsconfig.build.json"`
   - Uses the typescript compiler to transpile all of our .ts files to javascript. We first remove the old dist (prior build). When building for production we use a separate tsconfig file that excludes the tests folder.
- `"heroku-postbuild": "npm run migrate-latest"`
   - Heroku uses this script instead of "build". Our heroku deployment has a buildpack that manages the typescript transpiling and dependencies for us
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

## Project root files
- **Procfile** - this is a file that Heroku uses to know how to start our app. It points to our entry point, i.e. dist/main.js
- **tsconfig.json** - 
- **tsconfig.build.json** - extends the actual tsconfig.json but customizes it slightly. Primarily, it excludes transpiling the /tests folder, which doesn't need to go to /dist
- **.env** - Stores environment variables. This file *is not version controlled (it in .gitignore)*.

# Project architecture

## ORM, validation, and type safety
- We are using **Objection.js** as our ORM (built on top of **Knex** query builder)
- An Objection model (e.g. ResourceModel) defines the properties of the database row and provides a jsonSchema to validate the model data before any insert/update operation
- To pass a non-model version of the item around, we use a type derived from the model object: `export type ResourceType = ModelObject<ResourceModel>`, which contains all the properties defined in the model

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