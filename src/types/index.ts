export * from "./scanService.types";

export interface UserScanRequest {
  userPosition: UserPosition;
}

export type UserPosition = [number, number] | number[];
