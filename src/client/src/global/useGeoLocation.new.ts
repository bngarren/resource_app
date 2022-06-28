import * as React from "react";

const getCurrentPositionPromise = (options?: PositionOptions) => {
  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
};

export const useGeoLocation = () => {
  const watchId = React.useRef<number | null>(null);
  const watchTimer = React.useRef<NodeJS.Timeout>();
  const improvingAccuracyTimer = React.useRef<NodeJS.Timeout>();
  const [lastWatchResult, setLastWatchResult] =
    React.useState<GeolocationPosition | null>(null);
  const numberOfWatchResults = React.useRef(0);
  const [location, _setLocation] =
    React.useState<GeolocationCoordinates | null>(null);
  const lastLocation = React.useRef<GeolocationCoordinates | null>(null);
  const [isWatching, setIsWatching] = React.useState(false);

  const setLocation = (l: GeolocationCoordinates | null) => {
    _setLocation(l);
    lastLocation.current = l;
  };

  const watchResult = (position: GeolocationPosition) => {
    setLastWatchResult(position);
    numberOfWatchResults.current++;
  };

  const watchError = (error: GeolocationPositionError) => {
    console.error(error.message);
  };

  const endWatcher = React.useCallback((clearData = true) => {
    // ! DEBUG
    console.log(`Stopping watchId ${watchId.current}`);
    // !
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsWatching(false);
    }
    if (clearData) {
      setLastWatchResult(null);
      setLocation(null);
      numberOfWatchResults.current = 0;
    }
  }, []);

  const startWatcher = React.useCallback(
    (clearPrevious = false) => {
      endWatcher(clearPrevious);
      watchId.current = navigator.geolocation.watchPosition(
        watchResult,
        watchError,
        { enableHighAccuracy: true }
      );
      setIsWatching(true);

      // ! DEBUG
      console.log(`Started watchId ${watchId.current}`);
      // !
      watchTimer.current = setTimeout(() => {
        endWatcher();
      }, 10000);
    },
    [endWatcher]
  );

  React.useEffect(() => {
    if (!lastWatchResult) return;
    // ! DEBUG
    console.log(`watchResult, coords =`, lastWatchResult.coords);
    // !
    // If no location already present, must be the first round
    // for this watchPosition
    if (!location) {
      // ! DEBUG
      console.log(`useEffect, no prior location...`);
      // !

      // If this is our first watchResult we are dealing with,
      // start a timer.. If this is a subsequent watchResult,
      // we will just use it for setLocation
      if (numberOfWatchResults.current === 1) {
        // ! DEBUG
        console.log(
          `useEffect, starting a timer to get another watchResult...`
        );
        // !
        improvingAccuracyTimer.current = setTimeout(() => {
          // ! DEBUG
          console.log(`useEffect, timer up, using 2nd startWatcher`);
          // !
          // Start a new watchPosition, but don't clear previous results, etc.
          startWatcher(false);
        }, 2000);
      } else {
        setLocation(lastWatchResult.coords);
        clearTimeout(improvingAccuracyTimer.current);
        // ! DEBUG
        console.log(`useEffect, got another watchResult! used it`);
        // !
      }
    } else {
      setLocation(lastWatchResult.coords);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastWatchResult]);

  //! DEBUG
  React.useEffect(() => {
    if (!location) return;
    console.log("New location set", location);
  }, [location]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      console.log("cleanup");
      if (watchId.current != null)
        navigator.geolocation.clearWatch(watchId.current);
      clearTimeout(watchTimer.current);
    };
  }, []);

  return {
    startWatcher,
    lastLocation: lastLocation.current,
    isWatching,
  };
};
