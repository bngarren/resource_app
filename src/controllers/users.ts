import { StatusCodes } from "http-status-codes";
import {
  resSendJson,
  TypedRequest,
  TypedResponse,
} from "./../types/openapi.extended";
import { newTypedHttpError } from "./../types/openapi.extended";
import { AddUserRequest } from "../types/index";
import { userService } from "../services";
import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";

export const add = async (
  req: Request<unknown, unknown, AddUserRequest>,
  res: Response
) => {
  const { body } = req;

  if (!body["uuid"]) {
    res.status(400).send("Need a uuid to add a new user");
    return;
  }

  const result = await userService.handleCreateUser(body);

  if (!result) {
    res.sendStatus(500);
  } else {
    res.send(result);
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
