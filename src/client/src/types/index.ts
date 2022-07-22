import { LatLngTuple } from "leaflet";
export * as APITypes from "../global/state/openApiGenerated";
import { APITypes } from "./index";

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

/**
 * This type is used when we want a not-yet specified type of interactable from the various categories of interactables, such as resources, equipment, etc.
 *
 * For instance, this type is used when we send an interactable to the InteractionModal (we want to send data with a defined shape, but we don't know which type of interactable it is)
 */
export type AnyInteractable<
  T extends APITypes.ScanResult["interactables"] = APITypes.ScanResult["interactables"],
  K extends keyof T = keyof T,
  A extends T[K] = T[K]
> = A extends APITypes.Interactable[]
  ? {
      [P in keyof A[number]]: A[number][P];
    }
  : never;
