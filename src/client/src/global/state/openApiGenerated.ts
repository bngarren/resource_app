import { baseApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    postScan: build.mutation<PostScanApiResponse, PostScanApiArg>({
      query: (queryArg) => ({
        url: `/scan`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as openApiGenerated };
export type PostScanApiResponse = /** status 200 A successful scan */ {
  resources: Resource[];
  regions: Region[];
  interactableResources: number[];
};
export type PostScanApiArg = {
  body: {
    userPosition: Coordinate;
  };
};
export type Resource = {
  id?: number;
};
export type Region = {
  id?: number;
};
export type Coordinate = (number | number)[];
