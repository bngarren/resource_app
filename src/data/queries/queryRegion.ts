import { logger } from "../../logger";
import RegionModel from "../../models/Region";
import ResourceModel from "../../models/Resource";

/**
 *
 * Query to insert a Region row
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param model The RegionModel to insert
 * @returns The QueryBuilder for this query
 */
export const query_addRegion = (model: RegionModel) => {
  return model.$query().insert().returning("*");
};

/**
 *
 * Runs the QueryBuilder for query_addRegion
 *
 * @param model The RegionModel to insert
 * @returns The inserted RegionModel or undefined if failed
 */
export const addRegion = async (model: RegionModel) => {
  try {
    return await query_addRegion(model);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to get regions from an array of h3 indexes.
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param h3Array The array of h3 indexes
 * @returns The QueryBuilder for this query
 */
export const query_getRegionsFromH3Array = (h3Array: string[]) => {
  return RegionModel.query().select().whereIn("h3Index", h3Array);
};

/**
 *
 * Runs the QueryBuilder for query_getRegionsFromH3Array
 *
 * @param h3Array The array of h3 indexes
 * @returns An array of RegionModel
 */
export const getRegionsFromH3Array = async (h3Array: string[]) => {
  try {
    return await query_getRegionsFromH3Array(h3Array);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to modify (patch) a region's attribute(s).
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param regionId The id of the region to modify
 * @param data A json object of the attributes with new values
 * @returns The QueryBuilder for this query
 */
export const query_modifyRegion = (
  regionId: number,
  data: Partial<RegionModel>
) => {
  return RegionModel.query()
    .patch(data)
    .where("id", regionId)
    .returning("*")
    .first();
};

/**
 *
 * Runs the QueryBuilder for query_modifyRegion
 *
 * @param regionId The id of the region to modify
 * @param data A json object of the attributes with new values
 * @returns The updated RegionModel
 */
export const modifyRegion = async (
  regionId: number,
  data: Partial<RegionModel>
) => {
  try {
    return await query_modifyRegion(regionId, data);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to delete all resources associated with this region.
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param region The region of interest
 * @returns The QueryBuilder for this query
 */
export const query_deleteResourcesOfRegion = (region: RegionModel) => {
  return region.$relatedQuery<ResourceModel>("resources").del().returning("*");
};

/**
 *
 * Runs the QueryBuilder for query_deleteResourcesOfRegion
 *
 * @param region The region of interest
 * @returns An array of the deleted resources
 */
export const deleteResourcesOfRegion = async (region: RegionModel) => {
  try {
    return await query_deleteResourcesOfRegion(region);
  } catch (error) {
    logger.error(error);
  }
};
