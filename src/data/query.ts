import { logger } from "../logger";
import Region from "../models/Region";
import RegionModel, { RegionType } from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";

// ----- RESOURCES -----
const getResourceById = async (id: number) => {
  return ((await ResourceModel.query().select().where("id", id).first()) ||
    null) as ResourceType | null;
};

// ----- REGIONS -----
const createRegion = async (h3Index: string) => {
  try {
    return await RegionModel.transaction(async (trx) => {
      // Ensure this region doesn't already exist
      const select = await RegionModel.query(trx)
        .select("h3Index")
        .from("regions")
        .where("h3Index", h3Index);

      if (select.length !== 0) {
        logger.info(`Could not createRegion (${h3Index}) - already exists`);
        return null;
      }

      // Insert a new region
      const inserted = await RegionModel.query(trx)
        .insert({ h3Index: h3Index })
        .into("regions")
        .returning("*");
      logger.info("Created new region in db:", inserted);

      // Return a single Region object
      return inserted as RegionType;
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    return null;
  }
};

const updateUpdatedAtRegion = async (id: number, time: string) => {
  try {
    return ((await RegionModel.query()
      .patch({ updated_at: time })
      .where("id", id)
      .returning("*")
      .first()) || null) as RegionType | null;
  } catch (error) {
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
  return (await RegionModel.query()
    .select()
    .whereIn("h3Index", h3Array)) as RegionType[];
};

export {
  getResourceById,
  createRegion,
  updateUpdatedAtRegion,
  getRegionsFromH3Array,
};
