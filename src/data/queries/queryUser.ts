import { TransactionOrKnex, ref } from "objection";
import { logger } from "../../logger";
import UserModel from "../../models/User";

/**
 *
 * Query to insert a User row
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param model The UserModel to insert
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_addUser = (model: UserModel, trx?: TransactionOrKnex) => {
  return model.$query(trx).insert().returning("*");
};

/**
 *
 * Executes the query for query_addUser
 *
 * @param model The UserModel to insert
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The inserted UserModel or undefined if failed
 */
export const addUser = async (model: UserModel, trx?: TransactionOrKnex) => {
  try {
    return await query_addUser(model, trx);
  } catch (error) {
    logger.error(error);
  }
};

/**
 *
 * Query to get a User's inventory items in JSON
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getInventoryItems = (
  uuid: string,
  trx?: TransactionOrKnex
) => {
  return UserModel.query(trx)
    .select(ref("users.inventory:items").as("items"))
    .findOne("uuid", uuid);
};

/**
 *
 * Executes the query for query_getInventoryItems
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns A JSON object containing the user's inventory items
 */
export const getInventoryItems = async (
  uuid: string,
  trx?: TransactionOrKnex
) => {
  try {
    return await query_getInventoryItems(uuid, trx);
  } catch (error) {
    logger.error(error);
  }
};
