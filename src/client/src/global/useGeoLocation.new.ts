import * as React from "react";

export const useGeoLocation = () => {
  const watchId = React.useRef<number | null>(null);
  const watchTimer = React.useRef<NodeJS.Timeout>();
  const startTime = React.useRef<number | null>(null);

  const [lastWatchResult, setLastWatchResult] =
    React.useState<GeolocationPosition | null>(null);
  const lastWatchResultTime = React.useRef<number | null>(null);
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
    console.log(`endWatcher called`);
    // !
    if (watchId.current != null) {
      // ! DEBUG
      console.log(`ended ${watchId.current}`);
      // !
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsWatching(false);
    }
    if (clearData) {
      setLastWatchResult(null);
      setLocation(null);
      numberOfWatchResults.current = 0;
      lastWatchResultTime.current = null;
    }

    clearTimeout(watchTimer.current);
  }, []);

  const startWatcher = React.useCallback(
    (clearPrevious = true) => {
      endWatcher(clearPrevious);
      watchId.current = navigator.geolocation.watchPosition(
        watchResult,
        watchError,
        { enableHighAccuracy: true }
      );
      setIsWatching(true);
      startTime.current = new Date().getTime();

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
    if (!lastLocation.current) {
      // ! DEBUG
      console.log(`useEffect, no prior location...`);
      // !

      const fallbackTimer = setTimeout(() => {
        if (!lastLocation.current) {
          setLocation(lastWatchResult.coords);
        }
      }, 5000);

      const now = new Date().getTime();

      const timeSinceLastWatchResult = lastWatchResultTime.current
        ? now - lastWatchResultTime.current
        : 0;
      const timeSinceStart = startTime.current ? now - startTime.current : 0;
      console.log(
        `timeSinceLastWatchResult = ${timeSinceLastWatchResult}, timeSinceStart = ${timeSinceStart}`
      );
      if (timeSinceLastWatchResult > 1500 || timeSinceStart > 5000) {
        console.log("useEffect, times up! setLocation now");
        setLocation(lastWatchResult.coords);
        clearTimeout(fallbackTimer);
      } else {
        console.log("useEffect, still allowing more location data...");
      }
    }
    // Since this wasn't the first watchResult of this watchId session, we are assuming accuracy
    // is okay and just using the result
    else {
      setLocation(lastWatchResult.coords);
    }

    lastWatchResultTime.current = new Date().getTime();

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
