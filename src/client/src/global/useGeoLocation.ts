import * as React from "react";
import { UserPosition } from "../types";

const accuracyAttempts: Record<number, number> = {
  1: 5,
  2: 10,
};
const maxAccuracyAttempts = 2;

export const useGeoLocation = (watchTimeout = 30000) => {
  const [supported, setSupported] = React.useState<boolean>(true);
  const [error, setError] = React.useState("");

  const latestGeoCoordinates = React.useRef<GeolocationCoordinates>();
  const withinAttempts = React.useRef(0);
  const restartAttempts = React.useRef(0);
  const [location, setLocation] = React.useState<GeolocationCoordinates | null>(
    null
  );
  const lastLocation = React.useRef<UserPosition>();
  const [isWatching, setIsWatching] = React.useState(false);
  const watchId = React.useRef<number>();

  const initialTimer = React.useRef<NodeJS.Timeout>();
  const anotherTimer = React.useRef<NodeJS.Timeout>();

  //! DEBUG
  React.useEffect(() => {
    console.log("New location set");
  }, [location]);

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
    if (initialTimer.current != null) {
      clearTimeout(initialTimer.current);
    }
    setIsWatching(false);
    setLocation(null);
    setError("");
  }, []);

  const start = React.useCallback(
    (resetTimerOnly = false) => {
      if (!supported) return;

      // Define watchSuccess callback
      const watchSuccess = (position: GeolocationPosition) => {
        const time = new Date(position.timestamp).toLocaleTimeString();
        console.log(
          `${time.toUpperCase()} - useGeoLocation (watchId ${watchId.current})`,
          position.coords
        );

        // If we've gotten a watchSuccess, clear any previous
        // timer that was waiting for another watchSuccess
        clearTimeout(anotherTimer.current);

        // This is our latest geo coords from watchPosition
        latestGeoCoordinates.current = position.coords;

        withinAttempts.current++;
        console.log("withinAttempts", withinAttempts.current);

        // Too many good attempts
        // TODO Just use this location, but inform the user that
        // there is inaccuracy
        if (withinAttempts.current > 2) {
          setLocation(latestGeoCoordinates.current);
          restartAttempts.current = 0;
          console.log(
            "Too many within attempts. Probably as accurate as we can get at this time."
          );
        }
        // We've tried restarting watchPosition too many times,
        // and that didn't improve accuracy either
        else if (restartAttempts.current > maxAccuracyAttempts) {
          setLocation(latestGeoCoordinates.current);
          restartAttempts.current = 0;
          console.log(
            "Too many restart attempts. Probably as accurate as we can get at this time."
          );
        }
        // See if we've met our accuracy threshold
        else if (
          latestGeoCoordinates.current.accuracy <=
          accuracyAttempts[restartAttempts.current]
        ) {
          setLocation(latestGeoCoordinates.current);
          restartAttempts.current = 0;
          console.log("Passed accuracy check.");
        } else {
          // Give x amount of seconds to get another watchSuccess,
          // or we will just restart a new watchPosition
          anotherTimer.current = setTimeout(() => {
            //start();
          }, 1000);
          console.log(
            "Did not pass accuracy check",
            latestGeoCoordinates.current.accuracy
          );
        }

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
      };

      // Define watchError callback
      const watchError = (err: GeolocationPositionError) => {
        const message = `Failed to get geoLocation: ${err.message}`;
        console.warn(message);
        setError(message);
      };

      // - - - this starts the actual logic of start()

      if (!resetTimerOnly) {
        end();
        restartAttempts.current++;
        withinAttempts.current = 0;
        console.log("start() attempt#", restartAttempts.current);
        watchId.current = navigator.geolocation.watchPosition(
          watchSuccess,
          watchError,
          { enableHighAccuracy: true }
        );

        setIsWatching(true);
      } else {
        clearTimeout(initialTimer.current);
        const now = new Date().toLocaleTimeString();
        console.log(
          `${now.toUpperCase()} - useGeoLocation (watchId ${
            watchId.current
          }) - RESET TIMER`
        );
      }

      initialTimer.current = setTimeout(() => {
        end();
      }, watchTimeout);
    },
    [supported, watchTimeout, end]
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
      if (initialTimer.current != null) {
        clearTimeout(initialTimer.current);
        clearTimeout(anotherTimer.current);
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
