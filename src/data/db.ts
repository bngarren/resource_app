import knex from "knex";
import knexConfig from "../knexfile";
import * as dotenv from "dotenv";
import path from "path";
import { Resource, Region } from "./db.types";

// To use the .env file, we use the dotenv module to load the values
// Have to give the dotenv config the relative path to .env for it to work properly
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

//initialize knex
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

// ----- RESOURCES -----
const getResourceById = async (id: number) => {
  return await db<Resource>("resources").select().where("id", id);
};

// ----- REGIONS -----
const createRegion = async (h3Index: string) => {
  try {
    return await db.transaction(async (trx) => {
      // Ensure this region doesn't already exist
      const select: Region[] = await trx
        .select("h3Index")
        .from("regions")
        .where("h3Index", h3Index);

      if (select.length !== 0) {
        console.log(`Could not createRegion (${h3Index}) - already exists`);
        return null;
      }

      // Insert a new region
      const inserted: Region[] = await trx
        .insert({ h3Index: h3Index })
        .into("regions")
        .returning("*");
      console.log("Created new region in db:", inserted);

      // Return a single Region object
      if (inserted.length === 0) {
        return null;
      } else {
        return inserted[0];
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return null;
  }
};

/**
 *
 * @param h3Array Array of H3 index values for which to retrieve associated Regions
 * @returns Array of Regions
 */
const getRegionsFromH3Array = async (h3Array: string[]) => {
  return await db("regions").select().whereIn("h3Index", h3Array);
};

export { db, getResourceById, createRegion, getRegionsFromH3Array };
