import { listenerMiddleware } from "./listenerMiddleware";
import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { api } from "./apiSlice";
import authReducer from "./authSlice";
import appReducer from "./appSlice";
import geoLocationReducer from "./geoLocationSlice";

// Create the root reducer separately so we can extract the RootState type
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  app: appReducer,
  geoLocation: geoLocationReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== "production",
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(api.middleware),
  });
};

// TODO
// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization

// setupListeners(store.dispatch)

// Export our store's state and dispatch types
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];

// Export our custom selector and dispatch hooks that are pre-typed
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
