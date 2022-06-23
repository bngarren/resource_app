import RegionModel from "../models/Region";
import h3 from "h3-js";

export const getH3ChildrenOfRegion = (
  region: RegionModel,
  resolution: number
) => {
  return h3.h3ToChildren(region.h3Index, resolution);
};

export const selectRandom = (arr: string[], quantity: number) => {
  const result = [...Array(quantity)].map(() => {
    return arr[Math.floor(Math.random() * arr.length)];
  });
  return result;
};

/**
 * Checks whether a region has an overdue "reset_date"
 * @param region RegionModel
 * @returns True if overdue, false if not overdue or "reset_date" is null
 */
export const isRegionStale = (region: RegionModel) => {
  if (!region.reset_date) {
    return true;
  }
  const now = new Date();
  const reset_date = new Date(region.reset_date);
  return now >= reset_date;
};
