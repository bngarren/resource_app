import { UserPosition } from ".";

export interface ScanRequest {
  userPosition: UserPosition;
}

export type AddUserRequest = {
  uuid: string;
};
