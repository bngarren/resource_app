import {
  resSendJson,
  resSendStatus,
  TypedRequest,
  TypedResponse,
} from "./../types/openapi.extended";
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
    const result = await scanService.handleScan(
      userPosition,
      SCAN_DISTANCE,
      uuid
    );
    resSendStatus(res, StatusCodes.OK);
  } catch (error) {
    resSendJson(res, "default", {
      code: "500",
      message: "Unexpected server error during /scan",
    });
  }
};
