import ResourceModel, { ResourceType } from "../models/Resource";
import { logger } from "../logger";
import { createResource } from "../data/query";

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
 * @returns Promise with the resource, or null if validation or database query failure
 */
export const handleCreateResource = async (
  resourceJson: Omit<ResourceType, "id">
) => {
  let newResourceModel: ResourceModel;
  let resultResource: ResourceType | null;
  try {
    newResourceModel = ResourceModel.fromJson(resourceJson);
    resultResource = await createResource(newResourceModel);
  } catch (error) {
    logger.error(error);
    return null;
  }
  return resultResource;
};
