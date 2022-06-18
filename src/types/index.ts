export * from "./scanService.types";

export interface UserScanRequest {
  userPosition: UserPosition;
}

export interface UserPosition {
  latitude: number;
  longitude: number;
}
