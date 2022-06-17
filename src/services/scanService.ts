import { getResourceById } from "../data/db";

export const handleScan = async () => {
  return await getResourceById(2);
};
