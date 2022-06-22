import * as h3 from "h3-js";
import { REGION_H3_RESOLUTION, SCAN_DISTANCE } from "../constants";
import { getRegionsFromH3Array } from "../data/queries/queryRegion";
import { getResourceById } from "../data/queries/queryResource";
import type { RegionType } from "../models/Region";
import RegionModel from "../models/Region";
import { UserPosition } from "../types";
import { ScanResult } from "../types/scanService.types";
import { handleCreateRegion, updateRegion } from "./regionService";

//! TESTING ONLY
export const handleScan = async () => {
  return await getResourceById(1);
};

/**
 *
 * - Get the user's h3 index (resolution 9)
 * - Get kRing neighbors
 * - Server should create new regions, if needed
 * - Update each region (and repopulate resources, if needed)
 * - Determine if user's position is currently within a resource h3 hexagon (resolution 11)
 * - Find user equipment within the scanned regions
 * - Determine if user's position is currently within an equipment h3 hexagon
 *
 * Return to the user: List of scanned resources, distances/direction to each, option to mine resource,
 * option to pick up equipment
 *
 * @param userId
 * @param userPosition
 * @returns
 */
export const handleScanByUserAtLocation = async (
  userId: number,
  userPosition: UserPosition,
  scanDistance = 1
) => {
  // Get the h3 index based on the user's position
  const h3Index = h3.geoToH3(
    userPosition.latitude,
    userPosition.longitude,
    REGION_H3_RESOLUTION
  );

  // Get the 6 neighbors plus the user's h3 (7 total)
  const h3Group = h3.kRing(h3Index, scanDistance);

  try {
    // Query for regions associated with these h3 locations
    // If empty, should return [], not undefined
    const existingRegions = await getRegionsFromH3Array(h3Group);

    if (existingRegions == null) {
      throw new Error("Could not get regions from h3 array");
    }

    // Missing regions - not present in the database
    const missingRegions = h3Group.filter(
      (h) => !existingRegions.some((r) => r.h3Index === h)
    );

    // Create these regions in the database
    const promises_newRegions = await Promise.allSettled(
      missingRegions.map((m) => {
        return handleCreateRegion({ h3Index: m });
      })
    );
    const newRegions = promises_newRegions
      .filter(
        (x): x is PromiseFulfilledResult<RegionModel> =>
          x.status === "fulfilled"
      )
      .map((x) => x.value)
      .filter((x): x is RegionModel => x != null);

    let regions = [...existingRegions, ...newRegions];

    // the number of h3 indexes in the scan group should equal
    // the number of regions we now have (existing + newly created)
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }

    // Update each region
    const promises_updatedRegions = await Promise.allSettled(
      regions.map((r) => updateRegion(r.id))
    );
    regions = promises_updatedRegions
      .filter(
        (x): x is PromiseFulfilledResult<RegionModel> =>
          x.status === "fulfilled"
      )
      .map((x) => x.value)
      .filter((x): x is RegionModel => x != null);

    // expect that every region was sucessfully updated
    if (regions.length !== h3Group.length) {
      throw new Error("Error attempting to update regions");
    }

    // Return the scan result
    const scanResult: ScanResult = {
      regions: regions as RegionType[],
    };
    return scanResult;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return -1;
  }
};
