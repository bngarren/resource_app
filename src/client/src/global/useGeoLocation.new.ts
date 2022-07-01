import * as React from "react";

export const useGeoLocation = () => {
  /**
   * Whether navigator.geolocation is supported by the client
   */
  const isSupported = React.useRef(navigator.geolocation != null);

  /**
   * Holds any error string for this hook
   */
  const [error, setError] = React.useState("");

  /**
   * Id returned by the watchPosition function so that it
   * can be stopped/cleared at a later time
   */
  const watchId = React.useRef<number | null>(null);

  /**
   * Timeout used to end the watchPosition function
   */
  const watchTimer = React.useRef<NodeJS.Timeout>();

  /**
   * Marks the start time of the watchPosition function
   */
  const startTime = React.useRef<number | null>(null);

  /**
   * Marks the last time that a successful watchPosition result was received
   */
  const lastWatchResultTime = React.useRef<number | null>(null);

  /**
   * Tracks the number of successful watchPosition results.
   * We use it to know if at least more than 1 position has been received
   */
  const numberOfWatchResults = React.useRef(0);

  /**
   * This is the most recent location state of our hook
   */
  const [location, _setLocation] =
    React.useState<GeolocationCoordinates | null>(null);

  const setLocation = React.useCallback((l: GeolocationCoordinates | null) => {
    _setLocation(l);
  }, []);

  /**
   * Should be true when watchPosition is on/active.
   */
  const [isWatching, setIsWatching] = React.useState(false);

  const handleNewWatchResult = React.useCallback(
    (watchResult: GeolocationPosition) => {
      if (!watchResult) return;
      // ! DEBUG
      console.log(`New watchResult, coords =`, watchResult.coords);
      // !
      // If no initial location yet, then this is a fresh start of the watcher. Since it often has less acurracy, we will have logic here to deal with it
      if (!location) {
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
          if (!location) {
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
    [setLocation, location]
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
    numberOfWatchResults.current = 0;
    lastWatchResultTime.current = null;
    setLocation(null);

    clearTimeout(watchTimer.current);
  }, [setLocation]);

  /**
   * Starts a new watchPosition and saves a watchId.
   *
   * @param duration How long the watchPosition should run until automatically canceling (default 2 min)
   */
  const startWatcher = React.useCallback(
    (duration = 120000) => {
      if (!isSupported.current) {
        setError("Geolocation is not supported by your browser");
        return;
      } else {
        setError("");
      }

      // Clear any previous watcher
      endWatcher();

      setIsWatching(true);
      startTime.current = new Date().getTime();

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

      // ! DEBUG
      console.log(`Started watchId ${watchId.current}`);
      // !
      // Plan to cancel this watcher after a certain amount of time
      watchTimer.current = setTimeout(() => {
        endWatcher();
      }, duration);
    },
    [endWatcher, handleNewWatchResult]
  );

  // Startup / Cleanup
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
    endWatcher,
    location,
    isWatching,
    error,
  };
};
