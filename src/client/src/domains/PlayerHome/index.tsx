import * as React from "react";
import { useGetUserInventoryQuery } from "../../global/state/apiSlice.old";
import GatherController from "./GatherController";
import { useAuth } from "../../global/auth";
import { Box, Paper } from "@mui/material";
import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";

export type PlayerHomeView = "GATHER" | "INVENTORY" | "CRAFT";

const PlayerHome = () => {
  const [currentView, setCurrentView] =
    React.useState<PlayerHomeView>("GATHER");

  return (
    <>
      <Outlet />

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={2}
        component="nav"
      >
        <Navigation currentView={currentView} onChange={setCurrentView} />
      </Paper>
    </>
  );
};

export default PlayerHome;
