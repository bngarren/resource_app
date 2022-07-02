import { Button, List, ListItem, Stack, Typography } from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import HardwareIcon from "@mui/icons-material/Hardware";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import * as React from "react";
import MapWrapper from "../../../components/MapWrapper";
import { useFetch } from "../../../global/useFetch";
import { useGeoLocation } from "../../../global/useGeoLocation.new";
import { UserPosition, ScanStatus } from "../../../types";

const ScanController = () => {
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
  const [scanResult, setScanResult] = React.useState<any>();
  const [scanStatus, setScanStatus] = React.useState<ScanStatus>(null);
  const scanAnimationTimer = React.useRef<NodeJS.Timeout>();
  const [interactableResources, setInteractableResources] = React.useState<
    number[]
  >([]);

  const { backendFetch } = useFetch();

  const scan = React.useCallback(async () => {
    console.log("Scan started...");
    scanStartTime.current = new Date().getTime();

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("awaiting");
      startWatcher();
      return;
    }

    if (!location) {
      console.error("Did not have GPS location to scan");
      setScanStatus("error");
      return;
    }

    setScanStatus("scanning");

    setScanResult(null);
    setInteractableResources([]);

    const userPosition: UserPosition = [location.latitude, location.longitude];

    if (!userPosition) {
      setScanStatus("error");
      return;
    }

    scanCount.current = scanCount.current + 1;
    setLastScannedLocation(userPosition);

    console.log("sending:", userPosition);

    const data = await backendFetch(
      "POST",
      "scan",
      JSON.stringify({
        userPosition,
      }),
      true
    );

    const elapsedScanTime = new Date().getTime() - scanStartTime.current;
    const remainingAnimationTime = 1500 - elapsedScanTime;

    scanAnimationTimer.current = setTimeout(
      () => {
        startWatcher(true); // reset the timer
        setScanResult(data);
        setScanStatus("complete");
        setInteractableResources([...data.interactableResources]);
        console.log("Scan completed.");
        scanStartTime.current = null;
      },
      remainingAnimationTime > 0 ? remainingAnimationTime : 0
    );
  }, [backendFetch, isWatching, location, startWatcher]);

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
    if (scanStatus === "awaiting" && location) {
      console.log("Restarting scan with new location");
      scan();
    }
  }, [scanStatus, location, scan]);

  // Clean up
  React.useEffect(() => {
    return () => {
      clearTimeout(scanAnimationTimer.current);
      endWatcher();
    };
  }, [endWatcher]);

  return (
    <>
      <MapWrapper
        initLocation={initLocation.current}
        userPosition={lastScannedLocation}
        scanStatus={scanStatus}
        resources={scanResult?.resources}
      />
      {isWatching ? (
        <GpsFixedIcon sx={{ color: "darkgreen" }} />
      ) : (
        <GpsOffIcon />
      )}
      {location && `Acc ${location.accuracy}m`}

      <div>
        <Button
          onClick={scan}
          size="large"
          variant="contained"
          startIcon={<RadarIcon />}
          disabled={scanStatus === "scanning" || scanStatus === "awaiting"}
        >
          Scan
        </Button>
      </div>

      <div id="actions">
        <List>
          {scanResult &&
            interactableResources.map((r) => {
              const resource = scanResult?.resources?.find(
                (f: any) => f.id === r
              );

              if (resource != null)
                return (
                  <ListItem key={resource.id}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body1">
                        You have found <b>{resource.name}</b>!
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<HardwareIcon />}
                      >
                        Harvest
                      </Button>
                    </Stack>
                  </ListItem>
                );
            })}
        </List>
      </div>

      {scanResult && (
        <div>
          <List>
            {scanResult.resources
              ?.sort((a: any, b: any) => {
                return a.distanceFromUser - b.distanceFromUser;
              })
              .map((r: any) => {
                const shouldBold = r.distanceFromUser <= 100;
                return (
                  <ListItem
                    key={r.id}
                    style={{
                      fontWeight: shouldBold ? "bold" : "normal",
                      backgroundColor: r.userCanInteract
                        ? "#2AFB09"
                        : getDistanceColor(r.distanceFromUser),
                    }}
                  >
                    {r.id} - {r.name} - {Math.round(r.distanceFromUser)}m away
                  </ListItem>
                );
              })}
          </List>
        </div>
      )}
    </>
  );
};

export default ScanController;

function getDistanceColor(dist: number) {
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
}
