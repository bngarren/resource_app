import { newTypedHttpError } from "./../types/openapi.extended";
import { NextFunction } from "express";
import { logger } from "./../logger/index";
import {
  resSendJson,
  TypedRequest,
  TypedResponse,
} from "../types/openapi.extended";
import { SCAN_DISTANCE } from "../constants";
import { scanService } from "../services";
import { StatusCodes } from "http-status-codes";

/**
 * POST /scan
 */
export const scan = async (
  req: TypedRequest<"scan">,
  res: TypedResponse<"scan">,
  next: NextFunction
) => {
  const { user, userPosition } = req.body;

  // Validate request
  if (!userPosition || userPosition.length !== 2) {
    next(
      newTypedHttpError("scan", StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST.toString(),
        message: "Invalid user position in the request",
      })
    );
    return;
  }

  const uuid = user?.uuid;

  try {
    const scanResult = await scanService.handleScan(
      userPosition,
      SCAN_DISTANCE,
      uuid
    );
    resSendJson(res, StatusCodes.OK, scanResult);
  } catch (error) {
    logger.error(error, "Sending a status 500 unexpected error");
    next(error);
  }
};
