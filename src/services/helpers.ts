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
