import type {
  PreloadedState,
  Middleware,
  EnhancedStore,
  Store,
  AnyAction,
} from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { PropsWithChildren } from "react";
import type { Reducer } from "react";
import { setupStore } from "../global/state/store";
import type { RootState, AppStore } from "../global/state/store";
import { Provider } from "react-redux";
import { vi } from "vitest";

//https://redux.js.org/usage/writing-tests

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export const EmptyComponent = () => {
  return <></>;
};

export const mockNavigatorGeolocation = () => {
  const clearWatchMock = vi.fn();
  const getCurrentPositionMock = vi.fn();
  const watchPositionMock = vi.fn();

  const geolocation = {
    clearWatch: clearWatchMock,
    getCurrentPosition: getCurrentPositionMock,
    watchPosition: watchPositionMock,
    PERMISSION_DENIED: "",
    POSITION_UNAVAILABLE: "",
    TIMEOUT: "",
  };

  Object.defineProperty(global.navigator, "geolocation", {
    value: geolocation,
  });

  return { clearWatchMock, getCurrentPositionMock, watchPositionMock };
};
