import { baseApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    scan: build.mutation<ScanResponse, ScanArg>({
      query: (queryArg) => ({
        url: `/scan`,
        method: "POST",
        body: queryArg.scanBody,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as openApiGenerated };
export type ScanResponse =
  /** status 200 A successful scan returns metadata and interactables.

**Metadata** includes where the scan location occurred, timestamp, etc.

**Interactables** can include resources, machines, etc. Each of which is an object that provides info on the position, distance from user, and whether the user can interact with it (i.e. is close enough to it)
 */ InlineResponse200;
export type ScanArg = {
  scanBody: ScanBody;
};
export type Coordinate = number[];
export type Interactable = {
  position: Coordinate;
  distanceFromUser: number;
  userCanInteract: boolean;
};
export type Resource = {
  id: number;
  name: string;
  region_id: string;
  h3Index: string;
};
export type ScannedResource = Interactable &
  Resource & {
    vertices?: number[][];
  };
export type InlineResponse200Interactables = {
  scannedResources?: ScannedResource[];
};
export type InlineResponse200 = {
  metadata: object;
  interactables: InlineResponse200Interactables;
};
export type Error = {
  code: string;
  message: string;
};
export type ScanBody = {
  userPosition: Coordinate;
};
