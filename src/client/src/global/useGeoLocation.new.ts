import * as React from "react";

export const useGeoLocation = () => {
  const watchId = React.useRef<number | null>(null);
  const watchTimer = React.useRef<NodeJS.Timeout>();

  /**
   * In the case where it's the first time using the primary watchId
   * session, we don't want to just accept the first watchResult because
   * accuracy is often poor. And sometimes only 1 result comes through, especially
   * if the user is stationary. So we start this timer concurrently so that
   * we can always ensure we get at least a 2nd watchResult after some time.
   */
  const secondWatcherTimer = React.useRef<NodeJS.Timeout>();

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

      // If this is our first watchResult we are dealing with,
      // start a timer because sometimes we don't even get a second
      // watchResult from a given watchPosition.
      if (numberOfWatchResults.current === 1) {
        // ! DEBUG
        console.log(
          `useEffect, starting a timer to get another watchResult...`
        );
        // !

        console.log(secondWatcherTimer.current);
        secondWatcherTimer.current = setTimeout(() => {
          // ! DEBUG
          console.log(`useEffect, timer up, using 2nd startWatcher`);
          // !
          // Start a new watchPosition, but don't clear previous results, etc.
          startWatcher(false);
        }, 2000);
      }
      // We have now gotten at least 2 watchResults back...Figure out if accuracy is good enough
      else {
        setLocation(lastWatchResult.coords);
        clearTimeout(secondWatcherTimer.current);
        // ! DEBUG
        console.log(`useEffect, using a watchResult!`);
        // !
      }
    }
    // Since this wasn't the first watchResult of this watchId session, we are assuming accuracy
    // is okay and just using the result
    else {
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
      clearTimeout(secondWatcherTimer.current);
    };
  }, []);

  return {
    startWatcher,
    lastLocation: lastLocation.current,
    isWatching,
  };
};
