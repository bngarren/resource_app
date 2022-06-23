import { Request, Response } from "express";
import RegionModel from "../models/Region";
import ResourceModel from "../models/Resource";

export const showRecent = async (
  req: Request<unknown, unknown, unknown>,
  res: Response
) => {
  try {
    const recentRegions = await RegionModel.query()
      .select()
      .limit(100)
      .orderBy("updated_at", "desc");
    const recentResources = await ResourceModel.query()
      .select()
      .limit(100)
      .orderBy("region_id");
    res.status(200).send({
      regions: recentRegions,
      resources: recentResources,
    });
  } catch (error) {
    res.sendStatus(500);
  }
};
