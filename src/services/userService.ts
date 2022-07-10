import { UserType } from "./../models/User";
import { UserInventory } from "./../types/index";
import { TransactionOrKnex } from "objection";
import { addUser, getInventory, getUser } from "../data/queries/queryUser";
import { logger } from "../logger";
import UserModel from "../models/User";
import { handleDatabaseError } from "../util/errors";

/**
 * @description
 * ### handleCreateuser
 * Handles the creation of a new user
 *
 * To accomplish this:
 * - Validate the input json against the UserModel's jsonSchema
 * - Create the user (database query)
 * - Return the user (UserModel) to the caller
 *
 * @param userJson The new user's data in json object
 * @returns Promise resolving to a UserModel or Error
 */
export const handleCreateUser = async (
  userJson: Partial<UserModel>,
  trx?: TransactionOrKnex
) => {
  const modifiedUserJson = { ...userJson };
  if (!modifiedUserJson.inventory) {
    modifiedUserJson.inventory = UserModel.getEmptyInventory();
  }

  let inputUserModel: UserModel;
  try {
    // Validate json schema for the model
    inputUserModel = UserModel.fromJson(modifiedUserJson);
    // perform query
    const resultUser = await addUser(inputUserModel, trx);
    return resultUser;
  } catch (error) {
    // Includes all database/query errors
    // Filter/log the error and return it
    if (error instanceof Error) return error;
    // shouldn't need, but for type safety
    return new Error(String(error));
  }
};

/**
 * @description
 * ### handleGetUser
 * Gets a UserModel from the database, by user uuid
 * @param uuid User uuid
 */
export const handleGetUser = async (uuid: string) => {
  try {
    const result = await getUser(uuid);
    if (!(result instanceof UserModel)) {
      return new Error("Unknown error attemping to get user.");
    }
    return result;
  } catch (error) {
    if (error instanceof Error) return error;
    // shouldn't need, but for type safety
    return new Error(String(error));
  }
};

/**
 * @description
 * ### handleGetUserInventory
 * Gets the user's inventory
 *
 * **NOTE**: If there are unexpected errors, ensure that the database/model user inventory shape
 * matches the expected shape (i.e. that defined by OpenAPI, which generates the UserInventory type
 * used here.)
 * @param uuid User uuid
 */
export const handleGetUserInventory = async (uuid: string) => {
  try {
    const result = await getInventory(uuid);
    if (!result) {
      return new Error("Unknown error attemping to get user inventory.");
    }
    return result as UserInventory;
  } catch (error) {
    if (error instanceof Error) return error;
    // shouldn't need, but for type safety
    return new Error(String(error));
  }
};
