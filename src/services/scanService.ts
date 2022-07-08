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
import { logger } from "../logger";
import type { RegionType } from "../models/Region";
import RegionModel from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";
import { UserPosition } from "../types";
import { ScanResult, ScanResultResource } from "../types/scanService.types";
import { getAllSettled } from "../util/getAllSettled";
import { handleCreateRegion, updateRegion } from "./regionService";

/**
 * Given a set of regions (from the scanned area) and a user position, this
 * function will generate subsequent data for each resource, such as,
 * how far away it is from the user, whether the user is close enough to interact, etc.
 *
 * @param regions Array of regions
 * @param userPosition User's position in coordinates
 * @returns A promise resolving to a ScanResultResource
 */
const getResourceDataFromScannedRegions = async (
  regions: RegionModel[],
  userPosition: UserPosition
): Promise<ScanResultResource[]> => {
  // Get the resources for these regions
  const resources = await getAllSettled<ResourceModel[]>(
    regions.map((r) => getResourcesOfRegion(r.id))
  );
  const flat_resources = resources.flat(1);

  // Iterate through each resource and add data
  const result = flat_resources.map((r) => {
    const resourcePosition = h3.h3ToGeo(r.h3Index);

    // distance from the user
    const dist = h3.pointDist(userPosition, resourcePosition, "m");

    // Gets the vertices for the region's hexagon (for displaying on a map)
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
 * @description
 * ### handleScan
 * - Get the h3 index (resolution 9) of the scanned location (position)
 * - Get kRing neighbors (essentially the scan distance)
 * - Server should create new regions, if needed
 * - Update each region (and repopulate resources, if needed)
 * - Determine if the scanned position is currently within range of any interactables (resources, equipment, etc.)
 *
 *
 * @param userId
 * @param position
 * @returns A ScanResult
 */
export const handleScan = async (
  position: UserPosition,
  scanDistance = 1,
  userId?: string
) => {
  // Get the h3 index based on the user's position
  const h3Index = h3.geoToH3(position[0], position[1], REGION_H3_RESOLUTION);

  logger.debug("userPosition: %o", position);

  // Get the 6 neighbors plus the user's h3 (7 total)
  const h3Group = h3.kRing(h3Index, scanDistance);

  logger.debug("scan h3Group: %o", h3Group);

  try {
    if (!h3Group || h3Group.length === 0) {
      throw new Error("Could not process h3Group for the scan");
    }

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

    // - - - - Create these regions in the database - - - -
    const newRegions = await getAllSettled<RegionModel>(
      missingRegions.map((m) => handleCreateRegion({ h3Index: m }))
    );

    let regions = [...existingRegions, ...newRegions];

    // the number of h3 indexes in the scan group should equal
    // the number of regions we now have (existing + newly created)
    if (regions.length !== h3Group.length) {
      throw new Error("Did not match h3 indices with regions in the database");
    }

    // - - - - - Update each region - - - - -
    regions = await getAllSettled<RegionModel>(
      regions.map((r) => updateRegion(r.id))
    );

    // expect that every region was sucessfully updated
    if (regions.length !== h3Group.length) {
      throw new Error("Error attempting to update regions");
    }

    // - - - - - Get the resources of the scan - - - - -
    const resourceData = await getResourceDataFromScannedRegions(
      regions,
      position
    );

    // Which resources can be interacted with?
    const interactableResources = resourceData.flatMap((r) => {
      if (r.userCanInteract) return [r.id];
      return [];
    });

    // - - - - - Return the scan result - - - - -
    const scanResult: ScanResult = {
      regions: regions as RegionType[],
      resources: resourceData,
      interactableResources,
    };

    return scanResult;
  } catch (error) {
    if (error instanceof Error) logger.error(error.message);
    throw error;
  }
};
