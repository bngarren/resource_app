import { LatLngTuple } from "leaflet";

export const geoCoordinatesToLatLngTuple = (coords: GeolocationCoordinates) => {
  return [coords.latitude, coords.longitude] as LatLngTuple;
};
