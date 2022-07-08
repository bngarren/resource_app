import { LatLngTuple } from "leaflet";

export * as APITypes from "../global/state/openApiGenerated";

/**
 * For use with react routing
 */
export type LocationState = {
  from: { pathname: string };
};

/**
 * The authenticated user
 */
export type User = {
  uuid: string;
  email: string | null;
};

export type UserPosition = LatLngTuple;

export type ScanStatus =
  | "STARTED"
  | "AWAITING_GPS"
  | "COMPLETED"
  | "ERRORED"
  | null;
