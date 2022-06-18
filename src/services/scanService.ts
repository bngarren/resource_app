import * as h3 from "h3-js";
import { getResourceById, getRegionsFromH3Array } from "../data/db";
import { Region } from "../data/db.types";
import { UserPosition } from "../types";
import { handleCreateRegion } from "./regionService";

//! TESTING ONLY
export const handleScan = async () => {
  return await getResourceById(1);
};

export const handleScanByUserAtLocation = async (
  userId: number,
  userPosition: UserPosition
) => {
  // Get the h3 index based on the user's position
  const h3Index = h3.geoToH3(userPosition.latitude, userPosition.longitude, 9);

  // Get the user's h3 + 6 neighbors
  const h3Group = h3.kRing(h3Index, 1);

  try {
    // Query for regions associated with these h3 locations
    const existingRegions = await getRegionsFromH3Array(h3Group);

    const missingRegions = h3Group.filter(
      (h) => !existingRegions.some((r) => r.h3Index === h)
    );

    const newRegions = await Promise.allSettled(
      missingRegions.map((m) => {
        return handleCreateRegion(m);
      })
    );

    const regions = [...existingRegions, ...newRegions];

    //console.log("regions:", regions);
    // Verify that number of h3Indices equal number of regions
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }
    return regions;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};
