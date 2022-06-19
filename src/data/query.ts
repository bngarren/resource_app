import { Resource, Region } from "./db.types";
import { logger } from "../logger";
import { db } from "./db";

// ----- RESOURCES -----
const getResourceById = async (id: number) => {
  return await db<Resource>("resources").select().where("id", id);
};

// ----- REGIONS -----
const createRegion = async (h3Index: string) => {
  try {
    return await db.transaction(async (trx) => {
      // Ensure this region doesn't already exist
      const select = await trx
        .select("h3Index")
        .from("regions")
        .where("h3Index", h3Index);

      if (select.length !== 0) {
        logger.info(`Could not createRegion (${h3Index}) - already exists`);
        return null;
      }

      // Insert a new region
      const inserted: Region[] = await trx
        .insert({ h3Index: h3Index })
        .into("regions")
        .returning("*");
      logger.info("Created new region in db:", inserted);

      // Return a single Region object
      if (inserted.length === 0) {
        return null;
      } else {
        return inserted[0];
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
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

export { getResourceById, createRegion, getRegionsFromH3Array };
