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
  return await query_addUser(model, trx);
};

/**
 *
 * Query to get a User
 *
 * Note: This returns a chainable QueryBuilder instance
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns The QueryBuilder for this query
 */
export const query_getUser = (uuid: string, trx?: TransactionOrKnex) => {
  return UserModel.query(trx)
    .select("uuid")
    .findOne("uuid", uuid)
    .throwIfNotFound();
  // https://vincit.github.io/objection.js/api/query-builder/other-methods.html#throwifnotfound
};

/**
 *
 * Executes the query for query_getUser
 *
 * @param uuid The uuid of the user
 * @param trx Optional transaction object (http://knexjs.org/guide/transactions.html)
 * @returns A JSON object containing the user's data
 */
export const getUser = async (uuid: string, trx?: TransactionOrKnex) => {
  return await query_getUser(uuid, trx);
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
    .select(ref("inventory"))
    .findOne("uuid", uuid)
    .throwIfNotFound()
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
  return await query_getInventory(uuid, trx);
};
