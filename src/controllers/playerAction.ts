import {
  resSendJson,
  TypedRequest,
  TypedResponse,
} from "./../types/openapi.extended";
import httpStatus from "http-status";
import { SCAN_DISTANCE } from "../constants";
import { scanService } from "../services";

/**
 * POST /scan
 */
export const scan = async (
  req: TypedRequest<"scan">,
  res: TypedResponse<"scan">
) => {
  const { userPosition } = req.body;

  // Validate request
  if (!userPosition) {
    resSendJson(res, 400, {
      code: "400",
      message: "Invalid or missing user position",
    });
    return;
  }

  const result = await scanService.handleScanByUserAtLocation(
    1,
    userPosition,
    SCAN_DISTANCE
  );
  if (result === -1) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Could not get scan result" });
  } else {
    res.status(httpStatus.OK).send(result);
  }
};
