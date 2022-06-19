import knex from "knex";
import { knexConfig } from "../knexfile";
import config from "../config";

//initialize knex
export const db = knex(knexConfig[config.node_env || "development"]);
