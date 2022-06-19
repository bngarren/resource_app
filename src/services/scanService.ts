import * as h3 from "h3-js";
import { getResourceById, getRegionsFromH3Array } from "../data/query";
import type { RegionType } from "../models/Region";
import { UserPosition } from "../types";
import { ScanResult } from "../types/scanService.types";
import { handleCreateRegion, updateRegion } from "./regionService";

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

    const promises_newRegions = await Promise.allSettled(
      missingRegions.map((m) => {
        return handleCreateRegion(m);
      })
    );
    const newRegions = promises_newRegions
      .filter(
        (x): x is PromiseFulfilledResult<RegionType> => x.status === "fulfilled"
      )
      .map((x) => x.value)
      .filter((x): x is RegionType => x != null);

    let regions = [...existingRegions, ...newRegions];

    // Verify that number of h3Indices equal number of regions
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }

    // Update each region
    const promises_updatedRegions = await Promise.allSettled(
      regions.map((r) => updateRegion(r.id))
    );
    regions = promises_updatedRegions
      .filter(
        (x): x is PromiseFulfilledResult<RegionType> => x.status === "fulfilled"
      )
      .map((x) => x.value)
      .filter((x): x is RegionType => x != null);

    if (regions.length !== h3Group.length) {
      throw new Error("Error attempting to update regions");
    }

    // Return the scan result
    const scanResult: ScanResult = {
      regions: regions,
    };
    return scanResult;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return -1;
  }
};
