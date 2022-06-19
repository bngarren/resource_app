import { createRegion, updateUpdatedAtRegion } from "../data/query";
import { RegionType } from "../models/Region";

export const handleCreateRegion = async (h3Index: string) => {
  const result = await createRegion(h3Index);
  return result;
};

export const updateRegion = async (id: number): Promise<RegionType | null> => {
  // - Update the region's `updated_at` field to now
  // - If no resources are present, populate them now
  // - If the region's `reset_date` is overdue, repopulate the resources

  const now = new Date().toISOString();
  const result = await updateUpdatedAtRegion(id, now);

  return result;
};
