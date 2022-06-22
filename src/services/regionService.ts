import { transaction, TransactionOrKnex } from "objection";
import {
  REGION_RESET_INTERVAL,
  RESOURCES_PER_REGION,
  RESOURCE_H3_RESOLUTION,
} from "../constants";
import {
  addRegion,
  deleteResourcesOfRegion,
  modifyRegion,
} from "../data/queries/queryRegion";
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
  resource_h3_resultion: number,
  trx?: TransactionOrKnex
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
      return handleCreateResource(randomResource, trx);
    })
  );
  const newResources = promises_newResources
    .filter(
      (x): x is PromiseFulfilledResult<ResourceModel> =>
        x.status === "fulfilled"
    )
    .map((x) => x.value)
    .filter((x): x is ResourceModel => x != null);

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
 * @returns Promise resolving to a RegionModel, or null if validation or database query failure
 */
export const handleCreateRegion = async (
  regionJson: Partial<RegionModel>,
  withResources = true,
  trx?: TransactionOrKnex
) => {
  let inputRegionModel: RegionModel;
  let resultRegion: RegionModel | undefined;
  try {
    inputRegionModel = RegionModel.fromJson(regionJson);
    resultRegion = await addRegion(inputRegionModel, trx);
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
      RESOURCE_H3_RESOLUTION,
      trx
    );
  }

  return resultRegion;
};

export const updateRegion = async (id: number): Promise<RegionModel | null> => {
  // - If the region has a stale "reset_date", repopulate all resources and update "reset_date"
  // - If no resources are present, populate them now
  // - Update the region's `updated_at` field to now
  const region = await RegionModel.query().findById(id);

  if (!region) {
    logger.error(`Could not updateRegion (id=${id})`);
    return null;
  }

  // Check for existing resources
  const resources = await region.$relatedQuery<ResourceModel>("resources");

  /* We use a Transaction here to ensure that all queries are successful before committing them.
  This way, if one fails, they all fail (rolled back) */
  let trxStatus = true;
  const trx = await RegionModel.startTransaction();

  // Region's "reset_date" is stale/overdue -- repopulate all resources
  if (resources.length === 0 || isRegionStale(region)) {
    const _result1 = await deleteResourcesOfRegion(region, trx);
    if (_result1 == null) {
      await trx.rollback();
      trxStatus = false;
    }
    const _result2 = await populateResources(
      region,
      RESOURCES_PER_REGION,
      RESOURCE_H3_RESOLUTION,
      trx
    );

    if (_result2 == null) {
      await trx.rollback();
      trxStatus = false;
    }

    const nextResetDate = new Date();
    nextResetDate.setDate(nextResetDate.getDate() + REGION_RESET_INTERVAL);
    const _result3 = await modifyRegion(
      region.id,
      {
        reset_date: nextResetDate.toISOString(),
      },
      trx
    );

    if (_result3 == null) {
      await trx.rollback();
      trxStatus = false;
    }
  }

  // Update the region's 'update_at' field to time now
  // TODO Maybe the database should create the time?
  const now = new Date().toISOString();
  const _result4 = await modifyRegion(region.id, { updated_at: now }, trx);

  if (_result4 == null) {
    await trx.rollback();
    trxStatus = false;
  }

  let result;
  if (trxStatus === true) {
    await trx.commit();
    result = _result4;
  } else {
    logger.error("Could not complete the updateRegion transaction");
  }

  return result || null;
};
