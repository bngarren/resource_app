import { TransactionOrKnex } from "objection";
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
