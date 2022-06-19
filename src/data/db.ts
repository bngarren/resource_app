import knex from "knex";
import knexConfig from "../knexfile";
import { Model } from "objection";

export const setupDB = (env: string, returnInstance = false) => {
  const db = knex(knexConfig[env]);
  Model.knex(db);
  if (returnInstance) {
    return db;
  }
};
