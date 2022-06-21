import ResourceModel, { ResourceType } from "../models/Resource";
import { logger } from "../logger";
import { addResource } from "../data/query";

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
