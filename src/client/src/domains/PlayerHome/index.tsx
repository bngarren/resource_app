import { Button, List, ListItem, Stack, Typography } from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import HardwareIcon from "@mui/icons-material/Hardware";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import * as React from "react";
import MapWrapper from "../../components/MapWrapper";
import { useFetch } from "../../global/useFetch";
import { useGeoLocation } from "../../global/useGeoLocation.new";
import { UserPosition, ScanStatus } from "../../types";

const PlayerHome = () => {
  const { startWatcher, initLocation, lastLocation, isWatching } =
    useGeoLocation();
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

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("awaiting");
      startWatcher(10000);
      return;
    }

    if (!lastLocation) {
      console.error("Did not have GPS location to scan");
      setScanStatus("error");
      return;
    }

    setScanStatus("scanning");

    setScanResult(null);
    setInteractableResources([]);

    const userPosition: UserPosition = [
      lastLocation.latitude,
      lastLocation.longitude,
    ];

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
    scanAnimationTimer.current = setTimeout(() => {
      // startWatching(true); // reset the timer
      setScanResult(data);
      setScanStatus("complete");
      setInteractableResources([...data.interactableResources]);
      console.log("Scan completed.");
    }, 1500);
  }, [backendFetch, isWatching, lastLocation, startWatcher]);

  React.useEffect(() => {
    if (scanStatus === "awaiting" && initLocation) {
      scan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, initLocation]);

  // Clean up
  React.useEffect(() => {
    return () => {
      clearTimeout(scanAnimationTimer.current);
    };
  }, []);

  return (
    <>
      <MapWrapper
        initLocation={initLocation}
        userPosition={lastScannedLocation}
        scanStatus={scanStatus}
        resources={scanResult?.resources}
      />
      {isWatching ? (
        <GpsFixedIcon sx={{ color: "darkgreen" }} />
      ) : (
        <GpsOffIcon />
      )}
      {lastLocation && `Acc ${lastLocation.accuracy}m`}

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

export default PlayerHome;

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
