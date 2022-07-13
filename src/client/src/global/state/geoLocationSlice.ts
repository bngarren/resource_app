import { add } from "./../../../../controllers/users";
import { AppStartListening } from "./listenerMiddleware";
import {
  CaseReducer,
  createSlice,
  PayloadAction,
  Slice,
} from "@reduxjs/toolkit";
import config from "../../config";
import { ResetTvOutlined } from "@mui/icons-material";

type GeoLocationState = {
  watchId: number | null;
  startTime: number | null;
  isWatching: boolean;
  location: GeolocationPosition | null;
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
    startWatcher: (state) => state,
    startedWatcher: _startedWatcher,
    refreshWatcher: (state) => state,
    endWatcher: (state) => state,
    endedWatcher: _endedWatcher,
    newWatchResult: _newWatchResult,
    setWatchId: (state, action: PayloadAction<number | null>) => {
      state.watchId = action.payload;
    },
    setLocation: (state, action: PayloadAction<GeolocationPosition | null>) => {
      state.location = action.payload;
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

      // Clear any previous Watcher, i.e., watchPosition (watchId)
      if (orig.watchId != null) {
        console.log(`Clearing previous watchId: ${orig.watchId}`);
        navigator.geolocation.clearWatch(orig.watchId);
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
        }
      );
      console.log(`startWatcher watchId: ${watchId}`);
      listenerApi.dispatch(
        slice.actions.startedWatcher({ startTime: new Date().getTime() })
      );
      listenerApi.dispatch(slice.actions.setWatchId(watchId));

      // TURN OFF the Watcher after a predetermined duration
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
      const result = await keepAliveTask.result;
      // If we exit the while loop above, we should be calling endWatcher
      if (result.status === "ok") {
        listenerApi.dispatch(slice.actions.endWatcher());
      }
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
        //handle error
        return;
      }

      // No location has been set yet
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
        const result = await listenerApi.fork(async () => {
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
                if (payload.coords.accuracy < 5) {
                  shouldContinue = false;
                }
              }
            }
          }
          return finalResult;
        }).result;

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
