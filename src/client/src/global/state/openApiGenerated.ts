import { baseApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    scan: build.mutation<ScanResponse, ScanArg>({
      query: (queryArg) => ({
        url: `/scan`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    addUser: build.mutation<AddUserResponse, AddUserArg>({
      query: (queryArg) => ({
        url: `/users/add`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getUserInventory: build.query<
      GetUserInventoryResponse,
      GetUserInventoryArg
    >({
      query: (queryArg) => ({ url: `/users/${queryArg.uuid}/inventory` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as openApiGenerated };
export type ScanResponse =
  /** status 200 A successful scan returns metadata and interactables.

Metadata includes where the scan location occurred, timestamp, etc.

Interactables can include resources, machines, etc. Each of which is an object
that provides info on the position, distance from user, and whether the user can
interact with it (i.e. is close enough to it)
 */ ScanResult;
export type ScanArg = {
  /** A user position (latitude/longitude coordinates) is required to perform the scan.
    This should be in the form of a tuple: [latitude, longitude]
    
    A user property with user data is optional (a scan doesn't have to be performed by an app user per se)
     */
  body: {
    user?: {
      uuid: string;
    };
    userPosition: Coordinate;
  };
};
export type AddUserResponse = /** status 201 The user was sucessfully created
 */ {
  message: string;
};
export type AddUserArg = {
  /** A user uuid is required to create a new user. This is obtained via the authentication service (Firebase auth). Thus, this part must be complete prior to hitting this endpoint.
   */
  body: {
    uuid: string;
  };
};
export type GetUserInventoryResponse =
  /** status 200 Successful retrieval of user inventory.
   */ UserInventory;
export type GetUserInventoryArg = {
  /** Uuid string of the user */
  uuid: string;
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
  region_id: number;
  h3Index: string;
};
export type ScannedResource = Interactable &
  Resource & {
    vertices?: number[][];
  };
export type Region = {
  id: number;
  h3Index: string;
  reset_date: string;
};
export type ScannedRegion = Region;
export type ScanResult = {
  metadata: {
    scannedLocation?: Coordinate;
    timestamp?: string;
  };
  interactables: {
    scannedResources: ScannedResource[];
  };
  canInteractWith: {
    scannedResources?: number[];
  };
  scannedRegions: ScannedRegion[];
};
export type ErrorResponse = {
  code: string;
  message: string;
};
export type InventoryItem = {
  id: number;
  name: string;
};
export type UserInventory = {
  metadata: {
    updated_at: string;
  };
  items: {
    byId: InventoryItem[];
    allIds: number[];
  };
};
