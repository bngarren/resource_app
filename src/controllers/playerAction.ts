import { Request, Response } from "express";
import httpStatus from "http-status";
import { SCAN_DISTANCE } from "../constants";
import { scanService } from "../services";
import { ScanRequest } from "../types";

export const scan = async (
  req: Request<unknown, unknown, ScanRequest>,
  res: Response
) => {
  const { userPosition } = req.body;

  // Validate request
  if (!userPosition) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: `Invalid userPosition: ${userPosition}` });
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
