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

import RegionModel from "../models/Region";
import ResourceModel from "../models/Resource";
import { getAllSettled } from "../util/getAllSettled";
import { handleCreateRegion, updateRegion } from "./regionService";

// Types
import type { RegionType } from "../models/Region";
import type { ResourceType } from "../models/Resource";
import type {
  Coordinate,
  Interactable,
  Resource,
  ScannedResource,
  ScanResult,
} from "../types/";

/**
 * @description
 * ### getResourceDataFromScannedRegions
 * Given a set of regions (from the scanned area) and a user position, this
 * function will generate subsequent data for each resource, such as,
 * how far away it is from the user, whether the user is close enough to interact, etc.
 *
 * @param regions Array of regions (as database model)
 * @param userPosition User's position in coordinates
 * @returns A promise resolving to a ScannedResource
 */
const getResourceDataFromScannedRegions = async (
  regions: RegionModel[],
  userPosition: Coordinate
): Promise<ScannedResource[]> => {
  // Get the resources for these regions
  const resources = await getAllSettled<ResourceModel[]>(
    regions.map((r) => getResourcesOfRegion(r.id))
  );
  const flat_resources = resources.flat(1);

  // Iterate through each resource and add data
  const result: ScannedResource[] = flat_resources.map((r) => {
    // position
    const position = h3.h3ToGeo(r.h3Index);
    // distance from the user
    const dist = h3.pointDist(userPosition, position, "m");

    const interactable: Interactable = {
      category: "resources",
      position: position as [number, number],
      distanceFromUser: dist,
      userCanInteract: dist <= USER_AREA_OF_EFFECT,
    };

    const resource: Resource = {
      id: r.id,
      name: r.name,
      region_id: r.region_id,
      h3Index: r.h3Index,
    };

    // Gets the vertices for the region's hexagon (for displaying on a map)
    const vertices = h3.h3ToGeoBoundary(r.h3Index);

    // ScanResult type
    return {
      ...resource,
      ...interactable,
      vertices: vertices,
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
 * @returns A ScanResult
 */
export const handleScan = async (
  position: Coordinate,
  scanDistance = 1,
  userId?: string
): Promise<ScanResult> => {
  if (position == null || position.length !== 2 || scanDistance < 1) {
    throw new Error("Invalid parameters to handleScan");
  }

  // Get the h3 index based on the scan position
  const h3Index = h3.geoToH3(position[0], position[1], REGION_H3_RESOLUTION);

  // Get the 6 neighbors plus the central h3 (7 total)
  const h3Group = h3.kRing(h3Index, scanDistance);

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
    metadata: {
      scannedLocation: position,
      timestamp: new Date().toISOString(),
    },
    scannedRegions: [],
    interactables: {
      resources: resourceData,
    },
    canInteractWith: {
      resources: interactableResources,
    },
  };

  return scanResult;
};
