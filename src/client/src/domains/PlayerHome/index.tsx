import * as React from "react";
import { useGetUserInventoryQuery } from "../../global/state/apiSlice.old";
import GatherController from "./GatherController";
import { useAuth } from "../../global/auth";
import { Box, Paper } from "@mui/material";
import Navigation from "./Navigation";
import { Outlet, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../global/state/store";
import { startWatcher } from "../../global/state/geoLocationSlice";

/**
 * The types of Views on the PlayerHome page.
 * These are the choices for navigation.
 */
export type PlayerHomeView = "GATHER" | "INVENTORY" | "CRAFT";

const getViewFromRouteLocation = (location: string) => {
  const tail = location.split("/").pop();
  return (tail?.toUpperCase() as PlayerHomeView) || "GATHER";
};

const PlayerHome = () => {
  // Want to set our current navigation selection based on the route path
  const routerLocation = useLocation();
  const currentView = getViewFromRouteLocation(routerLocation.pathname);

  const dispatch = useAppDispatch();

  return (
    <>
      <Outlet />

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
