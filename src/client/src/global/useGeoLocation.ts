import * as React from "react";
import { UserPosition } from "../types";

export const useGeoLocation = (watchTimeout = 30000) => {
  const [supported, setSupported] = React.useState<boolean>(true);
  const [error, setError] = React.useState("");
  const [location, setLocation] = React.useState<GeolocationCoordinates | null>(
    null
  );
  const lastLocation = React.useRef<UserPosition>();
  const [isWatching, setIsWatching] = React.useState(false);
  const watchId = React.useRef<number>();
  const timer = React.useRef<NodeJS.Timeout>();

  const watchSuccess = React.useCallback<PositionCallback>((position) => {
    const time = new Date(position.timestamp).toLocaleTimeString();
    console.log(
      `${time.toUpperCase()} - useGeoLocation (watchId ${watchId.current})`,
      position.coords
    );
    setLocation(position.coords);

    if (
      !lastLocation.current ||
      lastLocation.current[0] !== position.coords.latitude ||
      lastLocation.current[1] !== position.coords.longitude
    ) {
      lastLocation.current = [
        position.coords.latitude,
        position.coords.longitude,
      ];
    }
    setError("");
  }, []);

  const watchError = React.useCallback<PositionErrorCallback>(
    (err: GeolocationPositionError) => {
      const message = `Failed to get geoLocation: ${err.message}`;
      console.warn(message);
      setError(message);
    },
    []
  );

  const end = React.useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      const now = new Date().toLocaleTimeString();
      console.log(
        `${now.toUpperCase()} - useGeoLocation (watchId ${
          watchId.current
        }) - END`
      );
      watchId.current = undefined;
    }
    if (timer.current != null) {
      clearTimeout(timer.current);
    }
    setIsWatching(false);
    setLocation(null);
    setError("");
  }, []);

  const start = React.useCallback(
    (resetTimerOnly = false) => {
      if (!supported) return;

      if (!resetTimerOnly) {
        end();
        watchId.current = navigator.geolocation.watchPosition(
          watchSuccess,
          watchError,
          { enableHighAccuracy: true }
        );

        setIsWatching(true);
      } else {
        clearTimeout(timer.current);
        const now = new Date().toLocaleTimeString();
        console.log(
          `${now.toUpperCase()} - useGeoLocation (watchId ${
            watchId.current
          }) - RESET TIMER`
        );
      }

      timer.current = setTimeout(() => {
        end();
      }, watchTimeout);
    },
    [supported, watchSuccess, watchError, watchTimeout, end]
  );

  React.useEffect(() => {
    if (!navigator.geolocation) {
      setSupported(false);
      setError("Geolocation is not supported by your browser");
    } else {
      setSupported(true);
      setError("");
    }

    return () => {
      if (timer.current != null) {
        clearTimeout(timer.current);
      }
    };
  }, [start]);

  return {
    startWatching: start,
    location,
    lastLocation: lastLocation.current,
    locationError: error,
    isWatching,
  };
};
