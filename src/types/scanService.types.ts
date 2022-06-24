import type { RegionType } from "../models/Region";
import { ResourceType } from "../models/Resource";

/**
 * This type is used to send resource data from the server to the client
 * after a user scans
 */
export type ScanResultResource = ResourceType & {
  /** [Latitude, longitude] */
  resourcePosition: number[];
  /** Array of [lat, long] pairs to describe the hexagon of the resource */
  vertices: number[][];
  /** Distance from the center of the hexagon to the user's position */
  distanceFromUser: number;
  /** When the user position is "close enough" to the resource such that
   * interaction is permitted, e.g. harvesting
   */
  userCanInteract: boolean;
};

export interface ScanResult {
  regions: RegionType[];
  resources: ScanResultResource[];
  /** Resource id's of resources that the user can interact with, e.g. harvest */
  interactableResources: number[];
}
