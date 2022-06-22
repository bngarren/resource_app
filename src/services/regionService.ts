import { RESOURCES_PER_REGION, RESOURCE_H3_RESOLUTION } from "../constants";
import {
  addRegion,
  deleteResourcesOfRegion,
  updateUpdatedAtRegion,
} from "../data/query";
import { logger } from "../logger";
import RegionModel, { RegionType } from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";
import { getH3ChildrenOfRegion, selectRandom } from "./helpers";
import { getRandomResource, handleCreateResource } from "./resourceService";

/**
 * Checks whether a region has an overdue "reset_date"
 * @param region RegionModel
 * @returns True if overdue, false if not overdue or "reset_date" is null
 */
const isRegionStale = (region: RegionModel) => {
  if (!region.reset_date) {
    return true;
  }
  const now = new Date();
  const reset_date = new Date(region.reset_date);
  return now >= reset_date;
};

/**
 * Given a region, finds random child H3 indexes and creates new resources in these areas
 *
 * @param region Region to populate with resources
 * @param quantity Number of resources to place in this region
 * @param resource_h3_resultion h3 resolution of the resource (i.e. size)
 * @returns The new resources
 */
const populateResources = async (
  region: RegionModel,
  quantity: number,
  resource_h3_resultion: number
) => {
  // Get the child h3's of this region at the specified resolution
  // These are potential spots for a resource
  const potentials = getH3ChildrenOfRegion(region, resource_h3_resultion);

  // Select some of these spots randomly
  const selected = selectRandom(potentials, quantity);

  // Now create the resources from these h3 indices
  const promises_newResources = await Promise.allSettled(
    // iterate each h3 index
    selected.map(async (s) => {
      // get random resource data
      const randomResource = await getRandomResource(region.id, s);
      // create the resource
      return handleCreateResource(randomResource);
    })
  );
  const newResources = promises_newResources
    .filter(
      (x): x is PromiseFulfilledResult<ResourceType> => x.status === "fulfilled"
    )
    .map((x) => x.value)
    .filter((x): x is ResourceType => x != null);

  return newResources;
};

/**
 * Handles the creation of a new region
 *
 * To accomplish this:
 * - Validate the input json against the RegionModel's jsonSchema
 * - Create the region (database query)
 * - Return the region (RegionType) to the caller
 *
 *
 * @param resourceJson The new resource's data in json object
 * @returns Promise with the RegionType, or null if validation or database query failure
 */
export const handleCreateRegion = async (
  regionJson: Partial<RegionModel>,
  withResources = true
) => {
  let inputRegionModel: RegionModel;
  let resultRegion: RegionModel | undefined;
  try {
    inputRegionModel = RegionModel.fromJson(regionJson);
    resultRegion = await addRegion(inputRegionModel);
  } catch (error) {
    logger.error(error);
    return null;
  }
  if (!resultRegion) {
    return null;
  }
  // Now create resources
  if (withResources) {
    await populateResources(
      resultRegion,
      RESOURCES_PER_REGION,
      RESOURCE_H3_RESOLUTION
    );
  }
  return resultRegion as RegionType;
};

export const updateRegion = async (id: number): Promise<RegionType | null> => {
  // - If the region has a stale "reset_date", repopulate all resources
  // - If no resources are present, populate them now
  // - Update the region's `updated_at` field to now
  const region = await RegionModel.query().findById(id);

  if (!region) {
    logger.error(`Could not updateRegion (id=${id})`);
    return null;
  }

  // Check for existing resources
  const resources = await region.$relatedQuery<ResourceModel>("resources");

  // Region's "reset_date" is stale/overdue -- repopulate all resources
  if (resources.length === 0 || isRegionStale(region)) {
    await deleteResourcesOfRegion(region);
    await populateResources(
      region,
      RESOURCES_PER_REGION,
      RESOURCE_H3_RESOLUTION
    );
  }

  // Update the region's 'update_at' field to time now
  // TODO Maybe the database should create the time?
  const now = new Date().toISOString();
  const result = await updateUpdatedAtRegion(region.id, now);

  return result;
};
