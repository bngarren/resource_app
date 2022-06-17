import { Request, Response } from "express";

export const scan = (req: Request, res: Response) => {
  res.status(200).send("Hit scan");
};
