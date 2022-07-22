import { APITypes } from "../types";
import { LatLngTuple } from "leaflet";

export const geoCoordinatesToLatLngTuple = (coords: GeolocationCoordinates) => {
  return [coords.latitude, coords.longitude] as LatLngTuple;
};

/**
 * Converts a lat/long tuple to a prettified string
 * @param latLng [latitude, longitude]
 * @returns "Latitude, longitude"
 */
export const latLngTupleToString = (
  latLng: APITypes.Coordinate | LatLngTuple
) => {
  const lat = latLng[0].toFixed(6);
  const long = latLng[1].toFixed(6);
  return `${lat}\u00B0, ${long}\u00B0`;
};

/**
 * ### getInteractables
 * ---
 * @description
 * Given a ScanResult, this function will return the interactables that the user/player can currently interact with.
 *
 * @param scanResult
 * @returns
 * ```javascript
 * // Return example
 * {
 *  resources: ScannedResources[]
 *  equipment: ScannedEquipment[]
 * }
 * ```
 */
export const getInteractables = (scanResult: APITypes.ScanResult) => {
  let category: keyof APITypes.ScanResult["canInteractWith"];
  const result: Partial<{
    [P in keyof APITypes.ScanResult["interactables"]]: APITypes.ScanResult["interactables"][P];
  }> = {};
  for (category in scanResult.canInteractWith) {
    const interactables = scanResult.interactables[category].filter(
      (interactable) => {
        return scanResult.canInteractWith[category]?.includes(interactable.id);
      }
    );
    result[category] = interactables;
  }
  return result;
};
