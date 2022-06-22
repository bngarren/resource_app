import { Request, Response } from "express";
import { SCAN_DISTANCE } from "../constants";
import { scanService } from "../services";
import { UserScanRequest } from "../types";

export const scan = async (
  req: Request<unknown, unknown, UserScanRequest>,
  res: Response
) => {
  const { body } = req;

  const result = await scanService.handleScanByUserAtLocation(
    1,
    body.userPosition,
    SCAN_DISTANCE
  );
  if (result === -1) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};
