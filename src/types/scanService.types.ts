import type { RegionType } from "../models/Region";
import { ResourceType } from "../models/Resource";

export type ScanResultResource = ResourceType & {
  resourcePosition: number[];
  vertices: number[][];
  distanceFromUser: number;
  userCanInteract: boolean;
};

export interface ScanResult {
  regions: RegionType[];
  resources: ScanResultResource[];
}
