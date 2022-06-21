import { logger } from "../logger";
import RegionModel, { RegionType } from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";

// ----- RESOURCES -----
const getResourceById = async (id: number) => {
  return ((await ResourceModel.query().select().where("id", id).first()) ||
    null) as ResourceType | null;
};

/**
 * Adds a Resource row to the database. Note that the return type
 * is ResourceModel and the caller should cast this to ResourceType
 * for further use in the app.
 *
 * @param model The ResourceModel to insert
 * @returns The inserted row (ResouceModel)
 */
const addResource = async (model: ResourceModel) => {
  let result: ResourceModel | undefined;
  try {
    result = await ResourceModel.query().insert(model).returning("*");
  } catch (error) {
    logger.error(error);
  }
  return result;
};

// ----- REGIONS -----

/**
 * Adds a Region row to the database. Note that the return type
 * is RegionModel and the caller should cast this to RegionType
 * for further use in the app.
 *
 * @param model The RegionModel to insert
 * @returns The inserted row (RegionModel)
 */
const addRegion = async (model: RegionModel) => {
  let result: RegionModel | undefined;
  try {
    result = await RegionModel.query().insert(model).returning("*");
  } catch (error) {
    logger.error(error);
  }
  return result;
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
  addResource,
  addRegion,
  updateUpdatedAtRegion,
  getRegionsFromH3Array,
};
