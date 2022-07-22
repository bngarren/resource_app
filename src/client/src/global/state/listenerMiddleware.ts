import { addGeoLocationListeners } from "./geoLocationSlice";
import {
  createListenerMiddleware,
  TypedStartListening,
} from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

// See https://redux-toolkit.js.org/api/createListenerMiddleware#organizing-listeners-in-files

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

addGeoLocationListeners(startAppListening);
