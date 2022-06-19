import { createRegion } from "../data/query";

export const handleCreateRegion = async (h3Index: string) => {
  const result = await createRegion(h3Index);
  return result;
};
