import { NextFunction, Request, Response } from "express";
import { SCAN_DISTANCE } from "../constants";
import { scanService } from "../services";
import { ScanRequest } from "../types";

export const scan = async (
  req: Request<unknown, unknown, ScanRequest>,
  res: Response,
  next: NextFunction
) => {
  const { userPosition } = req.body;

  if (!userPosition) {
    res.status(400).json({ message: `Invalid userPosition: ${userPosition}` });
    return;
  }

  const result = await scanService.handleScanByUserAtLocation(
    1,
    userPosition,
    SCAN_DISTANCE
  );
  if (result === -1) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};
