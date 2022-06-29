import * as React from "react";
import config from "./config";
import "./styles/App.css";
import MapWrapper from "./components/MapWrapper";
import { UserPosition } from "./types";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import RadarIcon from "@mui/icons-material/Radar";
import HardwareIcon from "@mui/icons-material/Hardware";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import { useAuth } from "./global/auth";
import { useFetch } from "./global/useFetch";
import { useGeoLocation } from "./global/useGeoLocation.new";
import { LatLngTuple } from "leaflet";

function App() {
  const { startWatcher, lastLocation, isWatching } = useGeoLocation();
  const [lastScannedLocation, setLastScannedLocation] =
    React.useState<UserPosition>();
  const scanCount = React.useRef<number>(0);
  const [scanResult, setScanResult] = React.useState<any>();
  const [scanStatus, setScanStatus] = React.useState<string | null>(null);
  const [interactableResources, setInteractableResources] = React.useState<
    number[]
  >([]);

  const { backendFetch } = useFetch();

  React.useEffect(() => {
    startWatcher(10000);
  }, [startWatcher]);

  const scan = React.useCallback(async () => {
    console.log("Scan started...");

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("awaiting location");
      startWatcher(10000);
      return;
    }

    if (!lastLocation) {
      console.error("Did not have GPS location to scan");
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
    // startWatching(true); // reset the timer
    setScanResult(data);
    setScanStatus(null);
    setInteractableResources([...data.interactableResources]);
    console.log("Scan completed.");
  }, [backendFetch, isWatching, lastLocation, startWatcher]);

  React.useEffect(() => {
    if (scanStatus === "awaiting location" && lastLocation) {
      scan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, lastLocation]);

  const getDistanceColor = (dist: number) => {
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
  };

  const mapLocation = lastLocation
    ? ([lastLocation.latitude, lastLocation.longitude] as LatLngTuple)
    : undefined;

  return (
    <div className="App">
      <MapWrapper
        initLocation={mapLocation}
        userPosition={lastScannedLocation}
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
    </div>
  );
}

export default App;
