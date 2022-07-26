import { AppStore, setupStore } from "./store";
import { mockNavigatorGeolocation } from "./../../util/test-util";
import { afterAll, beforeAll, vi } from "vitest";
import { startWatcher } from "./geoLocationSlice";

const { watchPositionMock } = mockNavigatorGeolocation();

const watchResultSuccess = {
  timestamp: new Date().getTime(),
  coords: {
    accuracy: 34.4,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 39.1369399,
    longitude: -77.1481149,
    speed: null,
  },
};
