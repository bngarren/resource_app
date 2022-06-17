import * as h3 from "h3-js";
import { getResourceById, getRegionsFromH3Array } from "../data/db";
import { handleCreateRegion } from "./regionService";

//! TESTING ONLY
export const handleScan = async () => {
  return await getResourceById(1);
};

export const handleScanByUserAtLocation = async (
  userId: number,
  h3Index: string
) => {
  // Query the database, perform some logic
  // Eventually return new data to the user

  const h3Group = h3.kRing(h3Index, 1);

  try {
    // Query for regions associated with these h3 locations
    const regionsQuery = await getRegionsFromH3Array(h3Group);

    // For each of the h3Indices of this scan, check if a
    // region exists, if not create it
    const regions = await Promise.all(
      h3Group.map(async (i) => {
        const exists = regionsQuery.find((el) => el.h3Index === i);
        if (!exists) {
          const newRegion = await handleCreateRegion(i);
          return newRegion;
        } else {
          return exists;
        }
      })
    );

    console.log("regions:", regions);
    // Verify that number of h3Indices equal number of regions
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }
    return regions;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};
