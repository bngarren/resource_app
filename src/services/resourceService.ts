import ResourceModel, { ResourceType } from "../models/Resource";
import { logger } from "../logger";
import { addResource } from "../data/query";
import { selectRandom } from "./helpers";

const resource_names = ["Gold", "Silver", "Iron", "Copper"];

/**
 * Given a region and resource h3 index, generates new resource data for this location
 * @param region_id Id of the region to which the resource belongs
 * @param h3Index h3 index of the resource
 * @returns The new resource
 */
export const getRandomResource = async (
  region_id: number,
  h3Index: string
): Promise<Omit<ResourceType, "id">> => {
  const [name] = selectRandom(resource_names, 1);
  return {
    name: name,
    region_id: region_id,
    h3Index: h3Index,
    quantity_initial: 100,
    quantity_remaining: 100,
  };
};

/**
 * Handles the creation of a new resource
 *
 * To accomplish this:
 * - Validate the input json against the ResourceModel's jsonSchema
 * - Create the resource (database query)
 * - Return the resource (ResourceType) to the caller
 *
 *
 * @param resourceJson The new resource's data in json object
 * @returns Promise with the ResourceType, or null if validation or database query failure
 */
export const handleCreateResource = async (
  resourceJson: Partial<ResourceModel>
) => {
  let inputResourceModel: ResourceModel;
  let resultResource: ResourceModel | undefined;
  try {
    inputResourceModel = ResourceModel.fromJson(resourceJson);
    resultResource = await addResource(inputResourceModel);
  } catch (error) {
    logger.error(error);
    return null;
  }
  if (!resultResource) {
    return null;
  }
  return resultResource as ResourceType;
};
