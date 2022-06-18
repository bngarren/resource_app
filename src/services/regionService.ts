import { createRegion } from "../data/db";

export const handleCreateRegion = async (h3Index: string) => {
  const result = await createRegion(h3Index);
  return result;
};
