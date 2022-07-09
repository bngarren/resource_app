import { openApiGenerated } from "./openApiGenerated";

/**
 * We export an "enhanced" version of the api generated by the RTK query code-gen, i.e. openApiGenerated.ts
 *
 * This allows us to add tag types and add providesTags and invalidates tags to our endpoints
 */
export const api = openApiGenerated.enhanceEndpoints({
  addTagTypes: ["User"],
  endpoints: {},
});

/**
 * * Have to manually export our hooks.
 *
 * These are defined in th openApiGenerated.ts file
 */
export const { useScanMutation, useGetUserInventoryQuery } = api;
