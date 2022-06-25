/** [Latitude, longitude] */
export type UserPosition = [number, number];

/** Mirrors the server's ResourceType */
type ResourceType = {
  id: number;
  h3Index: string;
  name: string;
  region_id: number;
  quantity_initial: number;
  quantity_remaining: number;
};

/** Should mirror the ScanResultResource from the server. This is a union type of ResourceType plus additional data.
 *
 * Must ensure these types defined on both the server
 * and client remain congruent!!
 */
export type Resource = ResourceType & {
  /** [Latitude, longitude] */
  resourcePosition: number[];
  /** Array of [lat, long] pairs to describe the hexagon of the resource */
  vertices: [number, number][];
  /** Distance from the center of the hexagon to the user's position */
  distanceFromUser: number;
  /** When the user position is "close enough" to the resource such that
   * interaction is permitted, e.g. harvesting
   */
  userCanInteract: boolean;
};

/** Should mirror the RegionType from the server.
 *
 * Must ensure these types defined on both the server
 * and client remain congruent
 */
export type Region = {
  id: number;
  h3Index: string;
  created_at: string;
  updated_at: string;
  reset_date: string;
};

export type LocationState = {
  from: { pathname: string };
};
