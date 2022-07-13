import { Alert, AlertColor, Button } from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import * as React from "react";
import MapWrapper from "../../../components/MapWrapper";
import { useAppSelector, useAppDispatch } from "../../../global/state/store";
import { startWatcher } from "../../../global/state/geoLocationSlice";
import { geoCoordinatesToLatLngTuple } from "../../../util";
import { useScan } from "./useScan";

const GatherController = () => {
  const dispatch = useAppDispatch();
  const isWatching = useAppSelector((state) => state.geoLocation.isWatching);

  // Get the initial GPS location to initialize the MapWrapper
  const initialLocation = useAppSelector((state) =>
    state.geoLocation.initialLocation
      ? geoCoordinatesToLatLngTuple(state.geoLocation.initialLocation.coords)
      : undefined
  );

  // This component will initialize a watcher session on mount if
  // one isn't already running
  const hasInitiatedWatcher = React.useRef(false);

  // The user scan operation
  const { scan, scannedLocation, scanStatus, scanResult } = useScan();

  React.useEffect(() => {
    if (!hasInitiatedWatcher.current) {
      dispatch(startWatcher);
      hasInitiatedWatcher.current = true;
    }
  }, [dispatch]);

  const handleScan = React.useCallback(async () => {
    scan();
  }, [scan]);

  const alertSeverity = {
    COMPLETED: "success",
    AWAITING_GPS: "info",
    STARTED: "info",
    ERRORED: "error",
  };

  return (
    <>
      <MapWrapper
        initialLocation={initialLocation}
        userPosition={scannedLocation}
        scanStatus={scanStatus}
        resources={scanResult?.interactables.scannedResources}
      />
      {scanStatus && (
        <Alert severity={alertSeverity[scanStatus] as AlertColor}>
          {scanStatus}
        </Alert>
      )}
      {isWatching ? (
        <GpsFixedIcon sx={{ color: "darkgreen" }} />
      ) : (
        <GpsOffIcon />
      )}

      <div>
        <Button
          onClick={handleScan}
          size="large"
          variant="contained"
          startIcon={<RadarIcon />}
          disabled={scanStatus === "STARTED" || scanStatus === "AWAITING_GPS"}
        >
          Scan
        </Button>
      </div>
    </>
  );
};

export default GatherController;

/* function getDistanceColor(dist: number) {
  if (dist > 500) {
    return "#FFC285";
  } else if (dist > 400) {
    return "#FFE085";
  } else if (dist > 300) {
    return "#FBFF85";
  } else if (dist > 200) {
    return "#E7FF85";
  } else if (dist > 100) {
    return "#D4FF85";
  } else if (dist > 75) {
    return "#C9FF85";
  } else if (dist <= 75) {
    return "#B5FF85";
  }
} */
