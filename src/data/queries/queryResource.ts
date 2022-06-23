import { TransactionOrKnex } from "objection";
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_addResource = (
  model: ResourceModel,
  trx?: TransactionOrKnex
) => {
  return model.$query(trx).insert().returning("*");
};

/**
 *
 * Executes the query for query_addResource
 *
 * @param model The ResourceModel to insert
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The inserted ResourceModel or undefined if failed
 */
export const addResource = async (
  model: ResourceModel,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_addResource(model, trx);
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
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getResourceById = (
  resourceId: number,
  trx?: TransactionOrKnex
) => {
  return ResourceModel.query(trx).findById(resourceId);
};

/**
 *
 * Executes the query for query_getResourceById
 *
 * @param resourceId The id of the resource
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The resource
 */
export const getResourceById = async (
  resourceId: number,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_getResourceById(resourceId, trx);
  } catch (error) {
    logger.error(error);
  }
};
