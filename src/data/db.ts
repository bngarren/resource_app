import knex from "knex";
import knexConfig from "../knexfile";
import * as dotenv from "dotenv";
import path from "path";
import { Resource } from "./db.types";

// To use the .env file, we use the dotenv module to load the values
// Have to give the dotenv config the relative path to .env for it to work properly
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

//initialize knex
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

const getResourceById = async (id: number) => {
  return await db<Resource>("resources").select().where("id", id);
};

export { db, getResourceById };
