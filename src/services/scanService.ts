import * as h3 from "h3-js";
import {
  REGION_H3_RESOLUTION,
  SCAN_DISTANCE,
  USER_AREA_OF_EFFECT,
} from "../constants";
import {
  getRegionsFromH3Array,
  getResourcesOfRegion,
} from "../data/queries/queryRegion";
import { getResourceById } from "../data/queries/queryResource";
import type { RegionType } from "../models/Region";
import RegionModel from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";
import { UserPosition } from "../types";
import { ScanResult, ScanResultResource } from "../types/scanService.types";
import { getAllSettled } from "../util/getAllSettled";
import { handleCreateRegion, updateRegion } from "./regionService";

//! TESTING ONLY
export const handleScan = async () => {
  return await getResourceById(1);
};

const getResourceDataFromScannedRegions = async (
  regions: RegionModel[],
  userPosition: UserPosition
): Promise<ScanResultResource[]> => {
  const resources = await getAllSettled<ResourceModel[]>(
    regions.map((r) => getResourcesOfRegion(r.id))
  );
  const flat_resources = resources.flat(1);
  const result = flat_resources.map((r) => {
    const resourcePosition = h3.h3ToGeo(r.h3Index);
    const dist = h3.pointDist(
      [userPosition.latitude, userPosition.longitude],
      resourcePosition,
      "m"
    );
    const vertices = h3.h3ToGeoBoundary(r.h3Index);
    return {
      ...(r as ResourceType),
      resourcePosition: resourcePosition,
      vertices: vertices,
      distanceFromUser: dist,
      userCanInteract: dist <= USER_AREA_OF_EFFECT,
    };
  });
  return result;
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
    const newRegions = await getAllSettled<RegionModel>(
      missingRegions.map((m) => handleCreateRegion({ h3Index: m }))
    );

    let regions = [...existingRegions, ...newRegions];

    // the number of h3 indexes in the scan group should equal
    // the number of regions we now have (existing + newly created)
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }

    // Update each region
    regions = await getAllSettled<RegionModel>(
      regions.map((r) => updateRegion(r.id))
    );

    // expect that every region was sucessfully updated
    if (regions.length !== h3Group.length) {
      throw new Error("Error attempting to update regions");
    }

    // Get the resources of the scan
    // ! WIP
    const resourceData = await getResourceDataFromScannedRegions(
      regions,
      userPosition
    );

    // Return the scan result
    const scanResult: ScanResult = {
      regions: regions as RegionType[],
      resources: resourceData,
    };

    return scanResult;
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return -1;
  }
};
