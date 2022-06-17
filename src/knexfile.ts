import type { Knex } from "knex";
import * as pg from "pg";
import * as dotenv from "dotenv";
import path from "path";

// To use the .env file, we use the dotenv module to load the values
// Have to give the dotenv config the relative path to .env for it to work properly
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

if (process.env.DATABASE_URL) {
  pg.defaults.ssl = { rejectUnauthorized: false };
}

if (!process.env.DB_PORT) {
  throw new Error("Could not establish database connection.");
}

const sharedConfig = {
  client: "pg",
  migrations: { directory: __dirname + "/data/migrations" },
  seeds: { directory: __dirname + "/data/seeds" },
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...sharedConfig,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: "",
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
    },
  },

  production: {
    ...sharedConfig,
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      ...sharedConfig.migrations,
      tableName: "knex_migrations",
    },
  },

  // Local database used for testing (jest)
  test: {
    ...sharedConfig,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: "",
      database: process.env.DB_TEST_NAME,
      port: parseInt(process.env.DB_PORT, 10),
    },
  },
};

export default config;
