import * as React from "react";
import config from "../../config";

/**
 * ### useGeoLocation
 * ---
 * @description
 * Custom hook for managing navigator.geolocation functionality. It starts/stops new watchPosition sessions, awaits callbacks, determines if geolocation accuracy meets threshold, and then makes location available in its return
 *
 * ---
 *
 * @returns
 * - startWatcher - starts a new watchPosition session.
 * - endWatcher - ends the current watchPosition session
 * - location - the most recent location that met criteria. Only non-null during an active watchPosition session
 * - isWatching - true if watchPosition is active
 * - error - error message
 */
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
   * Timeout used to stop waiting for more accurate results
   */
  const fallbackTimer = React.useRef<NodeJS.Timeout>();

  /**
   * Tracks the number of successful watchPosition results.
   * We use it to know if at least more than 1 position has been received
   */
  const numberOfWatchResults = React.useRef(0);

  /**
   * This is the most recent location state of our hook
   */
  const [location, setLocation] = React.useState<GeolocationCoordinates | null>(
    null
  );

  /**
   * Should be true when watchPosition is on/active.
   */
  const [isWatching, setIsWatching] = React.useState(false);

  /**
   * Handles the successful watch result from watchPosition callback.
   *
   * The majority of this logic is dealing with the case of having no prior location set (cold start for this watchPosition session) and awaiting a certain amount of time in order to improve accuracy.
   */
  const handleNewWatchResult = React.useCallback(
    (watchResult: GeolocationPosition) => {
      if (!watchResult) return;

      // If no initial location yet, then this is a fresh start of the watcher. Since it often has less acurracy, we will have logic here to deal with it
      if (!location) {
        const now = new Date().getTime();
        const timeSinceStart = startTime.current ? now - startTime.current : 0;

        /**
         * The fallback timer is started for the case that future/subsequent watchResult never comes. If this is the case, we need to take the watchResult we have and just use it, rather than waiting indefinitely.
         *
         * If a subsequent watchResult does come, because we are still waiting to improve accuracy, we will still use the timer, but will have less time now.
         */
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = setTimeout(() => {
          if (!location) {
            setLocation(watchResult.coords);
            console.log("Too long since startTime! setLocation now");
          }
        }, config.geoLocation_watcher_maxWait - timeSinceStart);

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
          clearTimeout(fallbackTimer.current);
        }
        // Or, if accuracy isn't perfect but we've stopped getting frequent watchResults, then use what we've got
        else if (
          timeSinceLastWatchResult >
          config.geoLocation_watcher_maxTimeSinceLastWatchResult
        ) {
          console.log("Too long since lastWatchResult! setLocation now");
          setLocation(watchResult.coords);
          clearTimeout(fallbackTimer.current);
        }
        // Otherwise, we will continue to wait until above criteria hit, or the fallbackTimer is up
        else {
          console.log("Still allowing more location data...");
        }
      } else {
        setLocation(watchResult.coords);
      }

      // Lastly, we save the time of this watchResult
      lastWatchResultTime.current = new Date().getTime();
    },
    [location]
  );

  /**
   * Ends the current watchPosition session, if present.
   *
   * Will clear/reset the data/stats for this session, such as location, numberOfWatchResults, lastWatchResultTime.
   *
   * Lastly, it will cancel the watchTimer, which is no longer needed since the watchPosition is done
   */
  const endWatcher = React.useCallback(() => {
    if (watchId.current != null) {
      // ! DEBUG
      console.log(`ended watchId ${watchId.current}`);
      // !
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsWatching(false);
    }
    numberOfWatchResults.current = 0;
    lastWatchResultTime.current = null;
    setLocation(null);

    clearTimeout(watchTimer.current);
  }, []);

  /**
   * Sets a timeout to call endWatcher after a specified amount of time. This effectively shuts down the continuous GPS activity after some time, unless restarted.
   */
  const newWatchTimer = React.useCallback(
    (duration: number) => {
      clearTimeout(watchTimer.current);
      watchTimer.current = setTimeout(() => {
        endWatcher();
      }, duration);
    },
    [endWatcher]
  );

  /**
   * Starts a new watchPosition and saves a watchId.
   *
   * @param duration How long the watchPosition should run until automatically canceling (default 2 min)
   * @param resetTimeOnly If true, will keep the same watcher and data, but reset the timeout, so that the watchPosition session keeps running and GPS stays on
   */
  const startWatcher = React.useCallback(
    (resetTimeOnly = false) => {
      if (!isSupported.current) {
        setError("Geolocation is not supported by your browser.");
        return;
      } else {
        setError("");
      }

      // We just want to add more time to this watcher
      if (resetTimeOnly) {
        if (watchId.current) {
          newWatchTimer(config.geoLocation_watcher_duration);
          console.log(`watchTimer ${watchId.current} reset`);
          // Don't need to do anything else
          return;
        }
        // If we don't have an active watchId, we will fall through and just make a new one anyway
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

      /**
       * Callback for a error result from watchPosition
       * @param error GeolocationPositionError
       */
      const watchError = (error: GeolocationPositionError) => {
        setError(error.message);
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

      newWatchTimer(config.geoLocation_watcher_duration);
    },
    [endWatcher, handleNewWatchResult, newWatchTimer]
  );

  // Startup / Cleanup
  React.useEffect(() => {
    return () => {
      if (watchId.current != null)
        navigator.geolocation.clearWatch(watchId.current);
      clearTimeout(watchTimer.current);
      clearTimeout(fallbackTimer.current);
    };
  }, []);

  return {
    location,
    startWatcher,
    endWatcher,
    isWatching,
    error,
  };
};
