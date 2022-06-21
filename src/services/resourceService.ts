import ResourceModel, { ResourceType } from "../models/Resource";
import { logger } from "../logger";
import { createResource } from "../data/query";

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
