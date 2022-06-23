import type { RegionType } from "../models/Region";
import { ResourceType } from "../models/Resource";

export type ScanResultResource = ResourceType & {
  distanceFromUser: number;
  userCanInteract: boolean;
};

export interface ScanResult {
  regions: RegionType[];
  resources: ScanResultResource[];
}
