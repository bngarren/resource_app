import { logger } from "./../logger/index";
import {
  resSendJson,
  resSendStatus,
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
  res: TypedResponse<"scan">
) => {
  const { user, userPosition } = req.body;

  // Validate request
  if (!userPosition || userPosition.length !== 2) {
    resSendJson(res, StatusCodes.BAD_REQUEST, {
      code: "400",
      message: "Invalid or missing user position",
    });
    return;
  }

  const uuid = user?.uuid;

  try {
    const scanResult = await scanService.handleScan(
      userPosition,
      SCAN_DISTANCE,
      uuid
    );
    logger.info("sending successful scan result back to client");
    resSendJson(res, StatusCodes.OK, scanResult);
  } catch (error) {
    logger.error(error, "status 500 unexpected error");
    resSendJson(res, "default", {
      code: "500",
      message: "Unexpected server error during /scan",
    });
  }
};
