import { StatusCodes } from "http-status-codes";
import {
  resSendJson,
  TypedRequest,
  TypedResponse,
} from "./../types/openapi.extended";
import { newTypedHttpError } from "./../types/openapi.extended";
import { userService } from "../services";
import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import UserModel from "../models/User";

/**
 * POST /users/add
 */
export const add = async (
  req: TypedRequest<"addUser">,
  res: TypedResponse<"addUser">,
  next: NextFunction
) => {
  const { uuid } = req.body;

  // Validate request
  if (!uuid || typeof uuid !== "string") {
    next(
      newTypedHttpError("addUser", StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST.toString(),
        message: "Invalid or missing uuid in the request",
      })
    );
    return;
  }
  // Check if uuid already exists
  // TODO

  try {
    const result = await userService.handleCreateUser({ uuid });
    if (result instanceof Error) {
      throw result;
    } else {
      resSendJson(res, StatusCodes.CREATED, {
        message: `User successfully created with uuid: ${result.uuid}.`,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      next(
        newTypedHttpError("addUser", "default", {
          code: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
          message: error.message,
        })
      );
    } else {
      next(String(error));
    }
  }
};

/**
 * GET /users/{uuid}
 */
export const getUser = async (
  req: TypedRequest<"getUser">,
  res: TypedResponse<"getUser">,
  next: NextFunction
) => {
  const { uuid } = req.params;

  // Validate request
  if (!uuid || typeof uuid !== "string") {
    next(
      newTypedHttpError("getUser", StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST.toString(),
        message: "Invalid uuid in the request",
      })
    );
    return;
  }

  try {
    const result = await userService.handleGetUser(uuid);
    if (result instanceof Error) {
      throw result;
    } else {
      resSendJson(res, StatusCodes.OK, {
        uuid: result.uuid,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      next(
        newTypedHttpError("getUser", "default", {
          code: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
          message: error.message,
        })
      );
    } else {
      next(String(error));
    }
  }
};

/**
 * GET /users/{uuid}/inventory
 */
export const getUserInventory = async (
  req: TypedRequest<"getUserInventory">,
  res: TypedResponse<"getUserInventory">,
  next: NextFunction
) => {
  const { uuid } = req.params;

  // Validate request
  if (!uuid || typeof uuid !== "string") {
    next(
      newTypedHttpError("getUserInventory", StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST.toString(),
        message: "Invalid uuid in the request",
      })
    );
    return;
  }

  try {
    const result = await userService.getUserInventory(uuid);
    if (result) {
      resSendJson(res, StatusCodes.OK, {
        ...result,
      });
    } else {
      next(
        newTypedHttpError("getUserInventory", "default", {
          code: StatusCodes.INTERNAL_SERVER_ERROR.toString(),
          message: "Could not get user's inventory. Possibly an invalid uuid?",
        })
      );
    }
  } catch (error) {
    logger.error(error, "Sending a status 500 unexpected error");
    next(error);
  }
};
