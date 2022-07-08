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
import { useGeoLocation } from "../../../global/useGeoLocation.new";
import { UserPosition, ScanStatus, APITypes } from "../../../types";
import { useScanMutation } from "../../../global/state/apiSlice";

const GatherController = () => {
  const { startWatcher, endWatcher, location, isWatching } = useGeoLocation();

  /**
   * Want to start the useGeoLocation watcher once when this component mounts. If true, has been started once.
   */
  const startedWatcherOnce = React.useRef(false);

  /**
   * Stores a ref to the initial location returned by useGeoLocation so that we can initialize our map centered on the user's position.
   */
  const initLocation = React.useRef<GeolocationCoordinates>();
  if (location && !initLocation.current) {
    initLocation.current = location;
    console.log("initLocation set as", initLocation.current);
  }

  const scanStartTime = React.useRef<number | null>();

  const [lastScannedLocation, setLastScannedLocation] =
    React.useState<UserPosition>();
  const scanCount = React.useRef<number>(0);
  const [scanStatus, setScanStatus] = React.useState<ScanStatus>(null);
  const scanAnimationTimer = React.useRef<NodeJS.Timeout>();

  const [scan, { data: scanResult }] = useScanMutation();

  const handleScan = React.useCallback(async () => {
    scanStartTime.current = new Date().getTime();
    setScanStatus(null);

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("AWAITING_GPS");
      startWatcher();
      return;
    }

    if (!location) {
      console.error("Did not have GPS location to scan");
      setScanStatus("ERRORED");
      return;
    }

    setScanStatus("STARTED");

    const userPosition: UserPosition = [location.latitude, location.longitude];

    if (!userPosition) {
      setScanStatus("ERRORED");
      return;
    }

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
            startWatcher(true); // reset the timer
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
  }, [scan, isWatching, location, startWatcher]);

  // Start the geo location watcher once on mount
  React.useEffect(() => {
    if (startedWatcherOnce.current) {
      return;
    }
    startWatcher();
    startedWatcherOnce.current = true;
  }, [startWatcher]);

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
      endWatcher();
    };
  }, [endWatcher]);

  const alertSeverity = {
    COMPLETED: "success",
    AWAITING_GPS: "info",
    STARTED: "info",
    ERRORED: "error",
  };

  return (
    <>
      <MapWrapper
        initLocation={initLocation.current}
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
      {location && `Acc ${location.accuracy}m`}

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
