import { AppStartListening } from "./listenerMiddleware";
import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit";
import config from "../../config";

type GeoLocationState = {
  /**
   * Id returned by the watchPosition function so that it
   * can be stopped/cleared at a later time
   */
  watchId: number | null;
  /**
   * Marks the start time of the watchPosition function
   */
  startTime: number | null;
  /**
   * Whether the watcher is active, should coincide with a non-null watchId
   */
  isWatching: boolean;
  /**
   * The most recent location
   */
  location: GeolocationPosition | null;
  /**
   * The initial/first location of the watcher
   */
  initialLocation: GeolocationPosition | null;
};

const _startedWatcher: CaseReducer<
  GeoLocationState,
  PayloadAction<{ startTime: number }>
> = (state, { payload }) => {
  state.startTime = payload.startTime;
  state.isWatching = true;
};

const _endedWatcher: CaseReducer<GeoLocationState> = (state) => {
  state.isWatching = false;
  state.watchId = null;
  state.startTime = null;
  state.initialLocation = null;
};

const _newWatchResult: CaseReducer<
  GeoLocationState,
  PayloadAction<GeolocationPosition | GeolocationPositionError>
> = (state) => state;

const slice = createSlice({
  name: "geoLocation",
  initialState: {
    watchId: null,
  } as GeoLocationState,
  reducers: {
    /**
     * Starts a new GeoLocation.watchPosition session, or if one is
     * already running, does nothing.
     */
    startWatcher: (state) => state,
    startedWatcher: _startedWatcher,
    /**
     * Sends a keep alive signal to the watcher, which extends the
     * duration that the watcher is active. E.g, after a user event
     * that requires geolocation, i.e. scan, harvest, etc.
     */
    refreshWatcher: () => {
      console.log(
        `watcher - refreshed ${Math.floor(
          config.geoLocation_watcher_duration / 1000
        )} s`
      );
    },
    endWatcher: (state) => state,
    endedWatcher: _endedWatcher,
    newWatchResult: _newWatchResult,
    setWatchId: (state, action: PayloadAction<number | null>) => {
      state.watchId = action.payload;
    },
    setLocation: (state, action: PayloadAction<GeolocationPosition | null>) => {
      state.location = action.payload;
      if (!state.initialLocation) {
        state.initialLocation = action.payload;
      }
      console.log(
        `watcher - Location: ${JSON.stringify(action.payload?.coords)}`
      );
    },
  },
});

export const { startWatcher, setWatchId, refreshWatcher } = slice.actions;

export default slice.reducer;

export const addGeoLocationListeners = (startListening: AppStartListening) => {
  /**
   * Start Watcher
   */
  startListening({
    actionCreator: slice.actions.startWatcher,
    effect: async (action, listenerApi) => {
      const { geoLocation: orig } = listenerApi.getOriginalState();

      // If startWatcher is called when a watcher is already running, ignore...
      if (orig.watchId != null) {
        console.log(
          `startWatcher called, already in progress, continuing watchId ${orig.watchId}`
        );
        return;
      }

      // Start new Watcher, i.e., watchPosition
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Not able to serialize a GeolocationPosition, so we copy the object manually...
          const p = {
            timestamp: position.timestamp,
            coords: {
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: position.coords.speed,
            },
          };
          listenerApi.dispatch(slice.actions.newWatchResult(p));
        },
        (positionError) => {
          listenerApi.dispatch(slice.actions.newWatchResult(positionError));
        },
        { enableHighAccuracy: true }
      );
      console.log(`startWatcher started watchId: ${watchId}`);
      listenerApi.dispatch(
        slice.actions.startedWatcher({ startTime: new Date().getTime() })
      );
      listenerApi.dispatch(slice.actions.setWatchId(watchId));

      // We want to TURN OFF the Watcher after a predetermined duration
      // i.e. don't want to keep GPS running unnecessarily in the app...

      // Waits for a refresh action, if it doesn't come, kill the watcher
      const keepAliveTask = listenerApi.fork(async () => {
        let keepAlive = true;
        while (keepAlive) {
          const didRefresh = await listenerApi.take((action) => {
            return slice.actions.refreshWatcher.match(action);
          }, config.geoLocation_watcher_duration);
          keepAlive = didRefresh != null;
        }
        return true;
      });

      await keepAliveTask.result;
      // If we exit the while loop in keepAliveTask, we should be calling endWatcher
      listenerApi.dispatch(slice.actions.endWatcher());
    },
  });
  /**
   * Handle watch result
   */
  startListening({
    actionCreator: slice.actions.newWatchResult,
    effect: async (action, listenerApi) => {
      const { geoLocation: orig } = listenerApi.getOriginalState();
      const watchResult = action.payload;

      if (watchResult instanceof GeolocationPositionError) {
        console.error(watchResult.message);
        return;
      }

      // ** No location has been set yet **
      // GPS accuracy seems to be worse after a cold start and seems to improve
      // after the first several results...The following logic tries to wait for
      // a period of time to allow accuracy to improve before sending the initial location.
      // This is an attempt to prevent the initial map view or user experience
      // like trying to interact from being inaccurate due to a bad initial location
      if (orig.location == null) {
        const timeSinceStart =
          watchResult.timestamp -
          (listenerApi.getState().geoLocation.startTime || 0);

        // Hit max duration, use this result
        if (timeSinceStart > config.geoLocation_watcher_maxWait) {
          console.log("watcher - too long since start, setting location");
          listenerApi.dispatch(slice.actions.setLocation(watchResult));
          return;
        }

        // Try to wait for additional results
        const improveAccuracyTask = await listenerApi.fork(async () => {
          let finalResult = watchResult;

          const nextResultPromise = listenerApi.take((action) => {
            return slice.actions.newWatchResult.match(action);
          }, config.geoLocation_watcher_maxTimeSinceLastWatchResult);

          // Stop criteria: nextResultPromise timed out or canceled, or we stop
          // becasue we met accuracy threshold
          let shouldContinue = true;
          while (shouldContinue) {
            // see if a new watch result comes through, i.e. this should be non-null if so
            const nextResult = await nextResultPromise;

            if (!nextResult) {
              console.log(
                "watcher - too long since last watch result, setting location"
              );
              shouldContinue = false;
            } else {
              const [action] = nextResult;
              if (
                slice.actions.newWatchResult.match(action) &&
                !(action.payload instanceof GeolocationPositionError)
              ) {
                const payload = action.payload;
                finalResult = payload;

                // stopping threshold
                // TODO - needs work
                if (payload.coords.accuracy < 5) {
                  shouldContinue = false;
                }
              }
            }
          }
          return finalResult;
        });

        const result = await improveAccuracyTask.result;

        if (result.status === "ok") {
          listenerApi.dispatch(slice.actions.setLocation(result.value));
        }
      }
    },
  });
  /**
   * End Watcher
   */
  startListening({
    actionCreator: slice.actions.endWatcher,
    effect: (action, listenerApi) => {
      const watchId = listenerApi.getState().geoLocation.watchId;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        console.log(`endWatcher watchId: ${watchId}`);
      }
      listenerApi.dispatch(slice.actions.setLocation(null));
      listenerApi.dispatch(slice.actions.endedWatcher());
    },
  });
};
