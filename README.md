# App notes

## npm scripts
- `"dev": "ts-node-dev --respawn --transpile-only ./src/main.ts | npx pino-pretty"`
   - Restarts target process (main.ts) each time it sees file changes and uses ts-node to compile to Typescript between each run. Similar to running nodemon with ts-node
- `"test": "jest --runInBand"`
   - We use the "--runInBand" flag to make jest run tests serially rather than in parallel (default) so that we don't have conflicts with multiple tests trying to operate on the test database at the same time
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