import {
  Alert,
  AlertColor,
  Button,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import HardwareIcon from "@mui/icons-material/Hardware";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import * as React from "react";
import MapWrapper from "../../../components/MapWrapper";
import { UserPosition, ScanStatus, APITypes } from "../../../types";
import { useScanMutation } from "../../../global/state/apiSlice";
import { useAppSelector, useAppDispatch } from "../../../global/state/store";
import {
  startWatcher,
  refreshWatcher,
} from "../../../global/state/geoLocationSlice";
import { geoCoordinatesToLatLngTuple } from "../../../util";

const GatherController = () => {
  const dispatch = useAppDispatch();
  const isWatching = useAppSelector((state) => state.geoLocation.isWatching);
  const location = useAppSelector((state) => state.geoLocation.location);
  const initialLocation = useAppSelector((state) =>
    state.geoLocation.initialLocation
      ? geoCoordinatesToLatLngTuple(state.geoLocation.initialLocation.coords)
      : undefined
  );

  ///
  const scanStartTime = React.useRef<number | null>();
  const [lastScannedLocation, setLastScannedLocation] =
    React.useState<UserPosition>();
  const scanCount = React.useRef<number>(0);
  const [scanStatus, setScanStatus] = React.useState<ScanStatus>(null);
  const scanAnimationTimer = React.useRef<NodeJS.Timeout>();

  const [scan, { data: scanResult }] = useScanMutation();

  React.useEffect(() => {
    if (!initialLocation) {
      dispatch(startWatcher);
    }
  }, [dispatch, initialLocation]);

  const handleScan = React.useCallback(async () => {
    scanStartTime.current = new Date().getTime();
    setScanStatus(null);

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("AWAITING_GPS");
      dispatch(startWatcher());
      return;
    }

    if (!location) {
      console.error("Did not have GPS location to scan");
      setScanStatus("ERRORED");
      return;
    }

    setScanStatus("STARTED");

    const userPosition: UserPosition = [
      location.coords.latitude,
      location.coords.longitude,
    ];

    scanCount.current = scanCount.current + 1;
    setLastScannedLocation(userPosition);

    // RTK query
    // Perform the scan query then use unwrap() to get the promised result
    scan({ body: { userPosition } })
      .unwrap()
      .then(() => {
        // Calculate remaining animation time
        const elapsedScanTime =
          new Date().getTime() - (scanStartTime.current as number);
        const remainingAnimationTime = 1500 - elapsedScanTime;

        scanAnimationTimer.current = setTimeout(
          () => {
            dispatch(refreshWatcher()); // resets the geolocation watcher duration
            setScanStatus("COMPLETED");
            scanStartTime.current = null;
            console.log("Scan completed.");
          },
          remainingAnimationTime > 0 ? remainingAnimationTime : 0
        );
      })
      .catch((error) => {
        setScanStatus("ERRORED");
        console.error(error);
      });
  }, [scan, isWatching, location, dispatch]);

  // This watches for new locations while we are in the "awaiting" state
  // E.g. the user clicked scan but no watcher session active, so we waited for a new one to boot up and give us a location
  React.useEffect(() => {
    if (scanStatus === "AWAITING_GPS" && location) {
      console.log("Restarting scan with new location");
      handleScan();
    }
  }, [scanStatus, location, handleScan]);

  // Clean up
  React.useEffect(() => {
    return () => {
      clearTimeout(scanAnimationTimer.current);
    };
  }, []);

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
        userPosition={lastScannedLocation}
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
      {location && `Acc ${location.coords.accuracy}m`}

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
