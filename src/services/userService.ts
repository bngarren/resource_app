import { TransactionOrKnex } from "objection";
import { addUser } from "../data/queries/queryUser";
import { logger } from "../logger";
import UserModel from "../models/User";

/**
 * Handles the creation of a new user
 *
 * To accomplish this:
 * - Validate the input json against the UserModel's jsonSchema
 * - Create the user (database query)
 * - Return the user (UserModel) to the caller
 *
 * @param userJson The new user's data in json object
 * @returns Promise resolving to a UserModel, or null if validation or database query failure
 */
export const handleCreateUser = async (
  userJson: Partial<UserModel>,
  trx?: TransactionOrKnex
) => {
  let inputUserModel: UserModel;
  let resultUser: UserModel | undefined;
  try {
    inputUserModel = UserModel.fromJson(userJson);
    resultUser = await addUser(inputUserModel, trx);
  } catch (error) {
    logger.error(error);
    return null;
  }
  if (!resultUser) {
    return null;
  }
  return resultUser;
};
