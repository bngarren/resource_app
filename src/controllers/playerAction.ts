import { Request, Response } from "express";
import { scanService } from "../services";
import { UserScanRequest } from "../types";

export const scan = async (
  req: Request<unknown, unknown, UserScanRequest>,
  res: Response
) => {
  const { body } = req;

  const result = await scanService.handleScanByUserAtLocation(
    1,
    body.userPosition
  );
  if (result === -1) {
    res.sendStatus(500);
  } else {
    res.send(result);
  }
};
