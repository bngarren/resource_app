import { LatLngTuple } from "leaflet";

export * as APITypes from "../global/state/openApiGenerated";

/**
 * The authenticated user
 */
export type User = {
  uuid: string;
  email: string | null;
};
