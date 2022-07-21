import type { APITypes } from "../types";
import { LatLngTuple } from "leaflet";

export const geoCoordinatesToLatLngTuple = (coords: GeolocationCoordinates) => {
  return [coords.latitude, coords.longitude] as LatLngTuple;
};

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
