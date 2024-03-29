import { AppStartListening } from "./listenerMiddleware";
import {
  CaseReducer,
  createSlice,
  isAnyOf,
  PayloadAction,
} from "@reduxjs/toolkit";
import config from "../../config";
import { log } from "./loggerSlice";

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
   * Use to flag that we are currently running this task within a listener instance. If already true, we skip creating another task.
   */
  pendingAccuracyTask: boolean;

  /**
   * The most recent location
   */
  location: GeolocationPosition | null;
  /**
   * The initial/first location of the watcher
   */
  initialLocation: GeolocationPosition | null;

  /**
   * Stores the last 3 errors
   */
  error: GeoLocationError[];
};

type GeoLocationError = {
  code?: number;
  message: string;
};

const initialState: GeoLocationState = {
  watchId: null,
  startTime: null,
  isWatching: false,
  pendingAccuracyTask: false,
  location: null,
  initialLocation: null,
  error: [],
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

const _newWatchResultSuccess: CaseReducer<
  GeoLocationState,
  PayloadAction<GeolocationPosition>
> = (state) => state;

const _newWatchResultError: CaseReducer<
  GeoLocationState,
  PayloadAction<GeoLocationError>
> = (state) => state;

const _addError: CaseReducer<
  GeoLocationState,
  PayloadAction<GeoLocationError>
> = (state, { payload }) => {
  state.error.push(payload);
  if (state.error.length > 3) {
    state.error.shift();
  }
};

const _clearError: CaseReducer<GeoLocationState> = (state) => {
  state.error = [];
};

const slice = createSlice({
  name: "geoLocation",
  initialState: initialState,
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
    refreshWatcher: (r) => r,
    endWatcher: (state) => state,
    endedWatcher: _endedWatcher,
    /**
     * A new watch result success is fired after a GeolocationPosition returns from watchPosition
     */
    newWatchResultSuccess: _newWatchResultSuccess,
    /**
     * A new watch result error is fired after a GeolocationPositionError returns from watchPosition
     */
    newWatchResultError: _newWatchResultError,
    setWatchId: (state, action: PayloadAction<number | null>) => {
      state.watchId = action.payload;
    },
    setPendingAccuracyTask: (state, action: PayloadAction<boolean>) => {
      state.pendingAccuracyTask = action.payload;
    },
    setLocation: (state, action: PayloadAction<GeolocationPosition | null>) => {
      state.location = action.payload;
      if (!state.initialLocation) {
        state.initialLocation = action.payload;
      }
    },
    addError: _addError,
    clearError: _clearError,
  },
});

export const { startWatcher, setWatchId, refreshWatcher } = slice.actions;

export const geoLocationActions = slice.actions;

export default slice.reducer;

/**
 * Subscribes the various listeners related to Geolocation
 * @param startListening A typed version of the startListening function
 */
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
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - startWatcher called, already in progress, continuing watchId ${orig.watchId}`,
            category: "redux",
          })
        );
        return;
      }

      // Make sure that GeoLocation is supported by the browser
      if (!navigator.geolocation) {
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - could not start, not supported/allowed by browser`,
            category: "redux",
            type: "warn",
          })
        );
        listenerApi.dispatch(
          slice.actions.addError({
            message: "Could not use GPS, not permitted by client.",
          })
        );
        return;
      }

      listenerApi.dispatch(
        slice.actions.startedWatcher({ startTime: new Date().getTime() })
      );

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
          listenerApi.dispatch(slice.actions.newWatchResultSuccess(p));
        },
        (positionError) => {
          listenerApi.dispatch(
            slice.actions.newWatchResultError({
              code: positionError.code,
              message: positionError.message,
            })
          );
        },
        {
          enableHighAccuracy: true,
          timeout: config.geoLocation_watcher_timeout,
        }
      );
      listenerApi.dispatch(
        log({
          message: `geoLocationSlice - startWatcher started watchId: ${watchId}`,
          category: "redux",
          type: "info",
        })
      );
      listenerApi.dispatch(slice.actions.setWatchId(watchId));

      // We want to TURN OFF the Watcher after a predetermined duration
      // i.e. don't want to keep GPS running unnecessarily in the app...

      // Waits for a refresh action, if it doesn't come, kill the watcher
      const keepAliveTask = listenerApi.fork(async () => {
        let keepAlive = true;
        while (keepAlive) {
          // We wait for a refresh action or an endWatcher action, or the watcher duration times out
          const sawAction = await listenerApi.take((action) => {
            return (
              slice.actions.refreshWatcher.match(action) ||
              slice.actions.endWatcher.match(action)
            );
          }, config.geoLocation_watcher_duration);

          // Keep alive when we saw an action that wasn't an endWatcher (i.e. must have been a refreshWatcher action)
          keepAlive =
            sawAction != null
              ? !slice.actions.endWatcher.match(sawAction[0])
              : false;
        }
        return true;
      });

      await keepAliveTask.result;
      // If we exit the while loop in keepAliveTask, we should be calling endWatcher
      listenerApi.dispatch(slice.actions.endWatcher());
    },
  });
  /**
   * Handle watch results
   *
   * Listens for both success and error results
   */
  startListening({
    matcher: isAnyOf(
      slice.actions.newWatchResultSuccess,
      slice.actions.newWatchResultError
    ),
    effect: async (action, listenerApi) => {
      const { geoLocation: orig } = listenerApi.getOriginalState();

      // Watch result errored
      if (slice.actions.newWatchResultError.match(action)) {
        const watchResultError = action.payload;

        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - watchResult error: ${watchResultError.message}`,
            category: "redux",
            type: "error",
          })
        );
        listenerApi.dispatch(slice.actions.addError(watchResultError));

        switch (watchResultError.code) {
          // If permission denied, end the watcher
          case GeolocationPositionError.PERMISSION_DENIED:
            listenerApi.dispatch(slice.actions.endWatcher());
            return;
        }
      }

      // Watch result success
      if (slice.actions.newWatchResultSuccess.match(action)) {
        const watchResult = action.payload;
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - new watchResult success`,
            category: "redux",
          })
        );

        // ** No location has been set yet **
        // GPS accuracy seems to be worse after a cold start and seems to improve
        // after the first several results...The following logic tries to wait for
        // a period of time to allow accuracy to improve before sending the initial location.
        // This is an attempt to prevent the initial map view or user experience
        // like trying to interact from being inaccurate due to a bad initial location
        if (orig.location == null) {
          const timeSinceStart =
            Date.now() - (listenerApi.getState().geoLocation.startTime || 0);

          // Hit max duration, use this result
          if (timeSinceStart > config.geoLocation_watcher_maxWait) {
            listenerApi.dispatch(
              log({
                message: `geoLocationSlice - max duration exceeded, setting location`,
                category: "redux",
              })
            );
            listenerApi.dispatch(slice.actions.setLocation(watchResult));
            listenerApi.cancelActiveListeners();
            return;
          }

          if (listenerApi.getState().geoLocation.pendingAccuracyTask === true) {
            return;
          }

          // Try to wait for additional results
          const improveAccuracyTask = await listenerApi.fork(async () => {
            listenerApi.dispatch(slice.actions.setPendingAccuracyTask(true));

            listenerApi.dispatch(
              log({
                message: `geoLocationSlice - (begin improveAccuracyTask)`,
                category: "redux",
              })
            );

            let finalResult = watchResult;

            // Stop criteria: nextResultPromise timed out or canceled, or we stop
            // because we met accuracy threshold
            let shouldContinue = true;
            while (shouldContinue) {
              // see if a new watch result comes through, i.e. this should be non-null if so
              listenerApi.dispatch(
                log({
                  message: `geoLocationSlice - (within improveAccuracyTask) - awaiting next watchResult`,
                  category: "redux",
                })
              );
              const nextResult = await listenerApi.take((action) => {
                return slice.actions.newWatchResultSuccess.match(action);
              }, config.geoLocation_watcher_maxTimeSinceLastWatchResult);

              if (!nextResult) {
                listenerApi.dispatch(
                  log({
                    message: `geoLocationSlice - (within improveAccuracyTask) - too long since last watchResult, setting location`,
                    category: "redux",
                  })
                );
                shouldContinue = false;
              } else {
                const [action] = nextResult;

                if (slice.actions.newWatchResultSuccess.match(action)) {
                  const payload = action.payload;
                  finalResult = payload;

                  listenerApi.dispatch(
                    log({
                      message: `geoLocationSlice - (within improveAccuracyTask) - new watchResult received`,
                      category: "redux",
                    })
                  );

                  // stopping threshold
                  // TODO - needs work
                  if (payload.coords.accuracy < 5) {
                    listenerApi.dispatch(
                      log({
                        message: `geoLocationSlice - (within improveAccuracyTask) - accuracy < 5, setting location`,
                        category: "redux",
                      })
                    );
                    shouldContinue = false;
                  }
                } else {
                  listenerApi.dispatch(
                    log({
                      message: `geoLocationSlice - (within improveAccuracyTask) - received watchResult error`,
                      category: "redux",
                      type: "error",
                    })
                  );
                }
              }
            }
            return finalResult;
          });

          const result = await improveAccuracyTask.result;
          listenerApi.dispatch(slice.actions.setPendingAccuracyTask(false));

          if (result.status === "ok") {
            listenerApi.dispatch(slice.actions.setLocation(result.value));
          } else {
            listenerApi.dispatch(
              log({
                message: `geoLocationSlice - improveAccuracyTask rejected or canceled`,
                category: "redux",
                type: "error",
              })
            );
          }
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
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - endWatcher: ${watchId}`,
            category: "redux",
            type: "info",
          })
        );
      }
      if (listenerApi.getState().geoLocation.location) {
        listenerApi.dispatch(slice.actions.setLocation(null));
      }
      listenerApi.dispatch(slice.actions.endedWatcher());
    },
  });

  /**
   * Logging
   */
  startListening({
    matcher: isAnyOf(
      geoLocationActions.refreshWatcher,
      geoLocationActions.setLocation
    ),
    effect: (action, listenerApi) => {
      if (geoLocationActions.refreshWatcher.match(action)) {
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - refresh ${Math.round(
              config.geoLocation_watcher_duration / 1000
            )}s (watchId: ${listenerApi.getState().geoLocation.watchId}) `,
            category: "redux",
            type: "debug",
          })
        );
      }

      if (geoLocationActions.setLocation.match(action)) {
        listenerApi.dispatch(
          log({
            message: `geoLocationSlice - setLocation`,
            category: "redux",
            type: "debug",
          })
        );
      }
    },
  });
};
