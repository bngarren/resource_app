import type { Knex } from "knex";
import * as pg from "pg";
import config from "./config";

if (process.env.DATABASE_URL) {
  pg.defaults.ssl = { rejectUnauthorized: false };
}

if (!config.db_port) {
  throw new Error("Could not establish database connection.");
}

const sharedConfig = {
  client: "pg",
  migrations: { directory: __dirname + "/data/migrations" },
  seeds: { directory: __dirname + "/data/seeds" },
};

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    ...sharedConfig,
    connection: {
      host: config.db_host,
      user: config.db_user,
      password: "",
      database: config.db_name,
      port: config.db_port,
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
      host: config.db_host,
      user: config.db_user,
      password: "",
      database: config.db_test_name,
      port: config.db_port,
    },
  },
};

export default knexConfig;
