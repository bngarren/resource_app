import * as React from "react";
import { useGetUserInventoryQuery } from "../../global/state/apiSlice.old";
import GatherController from "./GatherController";
import { useAuth } from "../../global/auth";
import { Box, Paper } from "@mui/material";
import Navigation from "./Navigation";
import { Outlet, useLocation } from "react-router-dom";
import { useGeoLocation } from "../../global/geoLocation/GeoLocation";

/**
 * The types of Views on the PlayerHome page.
 * These are the choices for navigation.
 */
export type PlayerHomeView = "GATHER" | "INVENTORY" | "CRAFT";

type GeoLocationContextType = {
  startWatcher: (resetTimeOnly?: boolean) => void;
  endWatcher: () => void;
  location: GeolocationCoordinates | null;
  isWatching: boolean;
  error: string;
  initLocation: GeolocationCoordinates | null | undefined;
};

export const GeoLocationContext = React.createContext<GeoLocationContextType>({
  startWatcher: (f) => f,
  endWatcher: () => {
    return;
  },
  location: null,
  isWatching: false,
  error: "",
  initLocation: null,
});

export const useGeoLocationContext = () => {
  return React.useContext(GeoLocationContext);
};

const getViewFromRouteLocation = (location: string) => {
  const tail = location.split("/").pop();
  return (tail?.toUpperCase() as PlayerHomeView) || "GATHER";
};

const PlayerHome = () => {
  // Want to set our current navigation selection based on the route path
  const routerLocation = useLocation();
  const currentView = getViewFromRouteLocation(routerLocation.pathname);

  const { startWatcher, endWatcher, location, isWatching } = useGeoLocation();

  /**
   * Start the useGeoLocation watcher once when this component mounts. If true, has been started once.
   */
  const startedWatcherOnce = React.useRef(false);

  /**
   * Stores a ref to the initial location returned by useGeoLocation so that we can initialize our map centered on the user's position.
   */
  const initLocation = React.useRef<GeolocationCoordinates>();
  if (location && !initLocation.current) {
    initLocation.current = location;
    console.log("initLocation in PlayerHome set as", initLocation.current);
  }

  // Start the geo location watcher once on mount
  React.useEffect(() => {
    if (startedWatcherOnce.current) {
      return;
    }
    startWatcher();
    startedWatcherOnce.current = true;
  }, [startWatcher]);

  // Clean up
  React.useEffect(() => {
    return () => {
      endWatcher();
    };
  }, [endWatcher]);

  const value = React.useMemo(
    () => ({
      startWatcher,
      endWatcher,
      location,
      isWatching,
      initLocation: initLocation.current,
      error: "",
    }),
    [endWatcher, isWatching, location, startWatcher]
  );

  return (
    <>
      <GeoLocationContext.Provider value={value}>
        <Outlet />
      </GeoLocationContext.Provider>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={2}
        component="nav"
      >
        <Navigation currentView={currentView} />
      </Paper>
    </>
  );
};

export default PlayerHome;
