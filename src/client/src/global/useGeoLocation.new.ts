import * as React from "react";

export const useGeoLocation = () => {
  // 1
  /**
   * Whether navigator.geolocation is supported by the client
   */
  const [supported, setSupported] = React.useState<boolean>(true);

  // 2
  /**
   * Holds any error string for this hook
   */
  const [error, setError] = React.useState("");

  // 3
  /**
   * Id returned by the watchPosition function so that it
   * can be stopped/cleared at a later time
   */
  const watchId = React.useRef<number | null>(null);

  // 4
  /**
   * Timeout used to end the watchPosition function
   */
  const watchTimer = React.useRef<NodeJS.Timeout>();

  // 5
  /**
   * Marks the start time of the watchPosition function
   */
  const startTime = React.useRef<number | null>(null);

  // 6
  /**
   * Marks the last time that a successful watchPosition result was received
   */
  const lastWatchResultTime = React.useRef<number | null>(null);

  // 7
  /**
   * Tracks the number of successful watchPosition results.
   * We use it to know if at least more than 1 position has been received
   */
  const numberOfWatchResults = React.useRef(0);

  // 8
  /**
   * This is the most recent location state of our hook
   */
  const [location, _setLocation] =
    React.useState<GeolocationCoordinates | null>(null);

  // 9
  /**
   * The first location that meets criteria to return to the caller
   */
  const initLocation = React.useRef<GeolocationCoordinates | null>();

  // 10
  /**
   * We also keep a ref to the last location for when we need referential stability.
   * E.g., when watchPosition ends, we clear the location, but we can still access the lastLocation
   * through this variable
   */
  const lastLocation = React.useRef<GeolocationCoordinates | null>(null);

  /**
   * Should be true when watchPosition is on/active.
   */
  const [isWatching, setIsWatching] = React.useState(false);

  /**
   * Sets both the location state and a lastLocation ref
   * @param l The new location to set
   */
  const setLocation = React.useCallback((l: GeolocationCoordinates | null) => {
    _setLocation(l);

    if (l != null) {
      lastLocation.current = l;
    }

    if (l != null && initLocation.current == null) {
      console.log("setting initLocation", l);
      initLocation.current = l;
    }

    console.log("Location set: ", l);
  }, []);

  const handleNewWatchResult = React.useCallback(
    (watchResult: GeolocationPosition) => {
      if (!watchResult) return;
      // ! DEBUG
      console.log(`New watchResult, coords =`, watchResult.coords);
      // !
      // If no initial location yet, then this is a fresh start of the watcher. Since it often has less acurracy, we will have logic here to deal with it
      if (!initLocation.current) {
        // ! DEBUG
        console.log(`No initial location yet!`);
        // !

        const now = new Date().getTime();
        const timeSinceStart = startTime.current ? now - startTime.current : 0;

        /**
         * Maximum amount of time we want to wait to improve accuracy
         */
        const max_time = 6000;

        /**
         * The fallback timer is started for the case that future/subsequent watchResult never comes. If this is the case, we need to take the watchResult we have and just use it, rather than waiting indefinitely.
         *
         * If a subsequent watchResult does come, because we are still waiting to improve accuracy, we will still use the timer, but will have less time now.
         */
        const fallbackTimer = setTimeout(() => {
          if (!initLocation.current) {
            setLocation(watchResult.coords);
            console.log("Too long since startTime! setLocation now");
          }
        }, max_time - timeSinceStart);

        // We continue to wait for more results, with max time limits...
        const timeSinceLastWatchResult = lastWatchResultTime.current
          ? now - lastWatchResultTime.current
          : 0;

        console.log(
          `timeSinceLastWatchResult = ${Math.round(
            timeSinceLastWatchResult / 1000
          )}, timeSinceStart = ${Math.round(timeSinceStart / 1000)}`
        );
        // If accuracy is good enough, just use it
        if (watchResult.coords.accuracy < 4) {
          console.log(
            "Received watchResult with good accuracy! setLocation now"
          );
          setLocation(watchResult.coords);
          clearTimeout(fallbackTimer);
        }
        // Or, if accuracy isn't perfect but we've stopped getting frequent watchResults, then use what we've got
        else if (timeSinceLastWatchResult > 1500) {
          console.log("Too long since lastWatchResult! setLocation now");
          setLocation(watchResult.coords);
          clearTimeout(fallbackTimer);
        }
        // Otherwise, we will continue to wait until above criteria hit, or the fallbackTimer is up
        else {
          console.log("Still allowing more location data...");
        }
      } else {
        setLocation(watchResult.coords);
      }

      // Lastly, we save the time of this watchResul
      lastWatchResultTime.current = new Date().getTime();
    },
    [setLocation]
  );

  /**
   * Ends the current watchPosition session, if present.
   *
   * Will clear/reset the data/stats for this session, such as location, numberOfWatchResults, lastWatchResultTime, and hasInitialLocation.
   *
   * Lastly, it will cancel the watchTimer, which is no longer needed since the watchPosition is done
   */
  const endWatcher = React.useCallback(() => {
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
    setLocation(null);
    numberOfWatchResults.current = 0;
    lastWatchResultTime.current = null;

    clearTimeout(watchTimer.current);
  }, [setLocation]);

  /**
   * Starts a new watchPosition and saves a watchId.
   *
   * @param duration How long the watchPosition should run until automatically canceling (default 2 min)
   */
  const startWatcher = React.useCallback(
    (duration = 120000) => {
      if (!supported) return;

      // Clear any previous watcher
      endWatcher();

      initLocation.current = null;

      /**
       * Callback for a successful result from watchPosition
       * @param position GeolocationPosition
       */
      const watchResult = (position: GeolocationPosition) => {
        numberOfWatchResults.current++;
        handleNewWatchResult(position);
      };

      const watchError = (error: GeolocationPositionError) => {
        console.error(error.message);
      };

      // Start a new watchPosition
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
      // Plan to cancel this watcher after a certain amount of time
      watchTimer.current = setTimeout(() => {
        endWatcher();
      }, duration);
    },
    [endWatcher, supported, handleNewWatchResult]
  );

  // Cleanup
  React.useEffect(() => {
    if (!navigator.geolocation) {
      setSupported(false);
      setError("Geolocation is not supported by your browser");
    } else {
      setSupported(true);
      setError("");
    }
    return () => {
      console.log("cleanup");
      if (watchId.current != null)
        navigator.geolocation.clearWatch(watchId.current);
      clearTimeout(watchTimer.current);
    };
  }, []);

  return {
    startWatcher,
    initLocation: initLocation.current,
    lastLocation: lastLocation.current,
    isWatching,
    error,
  };
};
