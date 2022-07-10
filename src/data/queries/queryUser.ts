import { UserType } from "./../../models/User";
import { TransactionOrKnex, ref, QueryBuilder } from "objection";
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
 * Query to get a User's inventory in JSON
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getInventory = (uuid: string, trx?: TransactionOrKnex) => {
  return UserModel.query(trx)
    .select(ref("inventory").as("inventory").castJson())
    .findOne("uuid", uuid)
    .castTo<UserType["inventory"]>();
};

/**
 *
 * Executes the query for query_getInventory
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns A JSON object containing the user's inventory
 */
export const getInventory = async (uuid: string, trx?: TransactionOrKnex) => {
  try {
    return await query_getInventory(uuid, trx);
  } catch (error) {
    logger.error(error);
  }
};
