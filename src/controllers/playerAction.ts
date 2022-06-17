import { Request, Response } from "express";
import { scanService } from "../services";

export const scan = async (req: Request, res: Response) => {
  const result = await scanService.handleScan();
  res.send(result);
};
