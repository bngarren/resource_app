import { TransactionOrKnex } from "objection";
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_addRegion = (
  model: RegionModel,
  trx?: TransactionOrKnex
) => {
  return model.$query(trx).insert().returning("*");
};

/**
 *
 * Executes the query for query_addRegion
 *
 * @param model The RegionModel to insert
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The inserted RegionModel or undefined if failed
 */
export const addRegion = async (
  model: RegionModel,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_addRegion(model, trx);
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getRegionsFromH3Array = (
  h3Array: string[],
  trx?: TransactionOrKnex
) => {
  return RegionModel.query(trx).select().whereIn("h3Index", h3Array);
};

/**
 *
 * Executes the query for query_getRegionsFromH3Array
 *
 * @param h3Array The array of h3 indexes
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns An array of RegionModel
 */
export const getRegionsFromH3Array = async (
  h3Array: string[],
  trx?: TransactionOrKnex
) => {
  try {
    return await query_getRegionsFromH3Array(h3Array, trx);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to get a region's associated resources.
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param regionId The id of the region to use
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getResourcesOfRegion = (
  regionId: number,
  trx?: TransactionOrKnex
) => {
  return RegionModel.relatedQuery<ResourceModel>("resources", trx).for(
    regionId
  );
};

/**
 * Executes the query for query_getResourcesOfRegion
 *
 * @param regionId The id of the region to use
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const getResourcesOfRegion = async (
  regionId: number,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_getResourcesOfRegion(regionId, trx);
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_modifyRegion = (
  regionId: number,
  data: Partial<RegionModel>,
  trx?: TransactionOrKnex
) => {
  return RegionModel.query(trx)
    .patch(data)
    .where("id", regionId)
    .returning("*")
    .first();
};

/**
 *
 * Executes the query for query_modifyRegion
 *
 * @param regionId The id of the region to modify
 * @param data A json object of the attributes with new values
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The updated RegionModel
 */
export const modifyRegion = async (
  regionId: number,
  data: Partial<RegionModel>,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_modifyRegion(regionId, data, trx);
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_deleteResourcesOfRegion = (
  region: RegionModel,
  trx?: TransactionOrKnex
) => {
  return region
    .$relatedQuery<ResourceModel>("resources", trx)
    .del()
    .returning("*");
};

/**
 *
 * Executes the query for query_deleteResourcesOfRegion
 *
 * @param region The region of interest
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns An array of the deleted resources
 */
export const deleteResourcesOfRegion = async (
  region: RegionModel,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_deleteResourcesOfRegion(region, trx);
  } catch (error) {
    logger.error(error);
  }
};
