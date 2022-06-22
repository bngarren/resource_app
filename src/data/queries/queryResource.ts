import { logger } from "../../logger";
import RegionModel from "../../models/Region";
import ResourceModel from "../../models/Resource";

/**
 *
 * Query to insert a Resource row
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param model The ResourceModel to insert
 * @returns The QueryBuilder for this query
 */
export const query_addResource = (model: ResourceModel) => {
  return model.$query().insert().returning("*");
};

/**
 *
 * Runs the QueryBuilder for query_addResource
 *
 * @param model The ResourceModel to insert
 * @returns The inserted ResourceModel or undefined if failed
 */
export const addResource = async (model: ResourceModel) => {
  try {
    return await query_addResource(model);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to get a resource by id.
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param resourceId The id of the resource
 * @returns The QueryBuilder for this query
 */
export const query_getResourceById = (resourceId: number) => {
  return ResourceModel.query().findById(resourceId);
};

/**
 *
 * Runs the QueryBuilder for query_getResourceById
 *
 * @param resourceId The id of the resource
 * @returns The resource
 */
export const getResourceById = async (resourceId: number) => {
  try {
    return await query_getResourceById(resourceId);
  } catch (error) {
    logger.error(error);
  }
};
