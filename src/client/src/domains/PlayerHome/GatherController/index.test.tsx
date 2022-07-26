import { waitFor, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import GatherController from ".";
import {
  mockNavigatorGeolocation,
  renderWithProviders,
} from "../../../util/test-util";

it.skip("should pass", async () => {
  const { watchPositionMock } = mockNavigatorGeolocation();

  watchPositionMock.mockReturnValueOnce(1);

  watchPositionMock.mockImplementationOnce((success, rejected) => {
    success({
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
    });
  });
});
