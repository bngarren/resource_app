import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "../util/errors";
import { logger } from "../logger";

/**
 * @description
 * ### errorHandler
 * This custom errorHandler excepts errors of the custom HttpError class
 *
 * @param error HttpError
 * @param req Express Request
 * @param res Express Response
 * @param next Express next function
 */
export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const code = error.code || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || "An unexpected server error occured.";
  const json = {
    code: code,
    message: message,
  };
  res.status(code).json(json);
  logger.fatal({ json });
};
