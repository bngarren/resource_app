import { addRegion, updateUpdatedAtRegion } from "../data/query";
import { logger } from "../logger";
import RegionModel, { RegionType } from "../models/Region";
import ResourceModel, { ResourceType } from "../models/Resource";
import { getH3ChildrenOfRegion, selectRandom } from "./helpers";
import { handleCreateResource } from "./resourceService";

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
export const handleCreateRegion = async (regionJson: Partial<RegionModel>) => {
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
  return resultRegion as RegionType;
};

export const updateRegion = async (id: number): Promise<RegionType | null> => {
  // - Update the region's `updated_at` field to now
  // - If no resources are present, populate them now
  // - If the region's `reset_date` is overdue, repopulate the resources
  const region = await RegionModel.query().findById(id);

  if (!region) {
    logger.error(`Could not updateRegion (id=${id})`);
    return null;
  }

  // Update the region's 'update_at' field to time now
  // TODO Maybe the database should create the time?
  const now = new Date().toISOString();
  const result = await updateUpdatedAtRegion(region.id, now);

  // Check for existing resources
  const resources = await region.$relatedQuery<ResourceModel>("resources");

  const RESOURCE_H3_RESOLUTION = 11;
  const RESOURCES_PER_REGION = 3;

  // If no resources are present, populate them now
  if (resources.length === 0) {
    // we want resources to have h3 resolution of 11
    const potentials = getH3ChildrenOfRegion(region, RESOURCE_H3_RESOLUTION);

    // select some randomly
    const selected = selectRandom(potentials, RESOURCES_PER_REGION);

    // ! HARD CODED - fixme
    const resource_names = ["Gold", "Silver", "Iron", "Copper"];

    // Now create the resources from these h3 indices
    const promises_newResources = await Promise.allSettled(
      selected.map((s) => {
        return handleCreateResource({
          name: selectRandom(resource_names, 1).pop(),
          region_id: region.id,
          h3Index: s,
          quantity_initial: 100,
          quantity_remaining: 100,
        });
      })
    );
    const newResources = promises_newResources
      .filter(
        (x): x is PromiseFulfilledResult<ResourceType> =>
          x.status === "fulfilled"
      )
      .map((x) => x.value)
      .filter((x): x is ResourceType => x != null);
  }

  return result;
};
