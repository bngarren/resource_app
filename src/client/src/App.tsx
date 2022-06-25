import * as React from "react";
import config from "./config";
import "./styles/App.css";
import Map from "./components/Map";
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

const Loading = () => {
  return (
    <Box flexDirection="column">
      <CircularProgress sx={{ color: "#D7F363" }} />
      <Typography variant="h5">Scanning...</Typography>
    </Box>
  );
};

function App() {
  const [userPosition, setUserPosition] = React.useState<UserPosition>();
  const [scanResult, setScanResult] = React.useState<any>();
  const [scanStatus, setScanStatus] = React.useState<string | null>(null);
  const [interactableResources, setInteractableResources] = React.useState<
    number[]
  >([]);
  const [recentRegions, setRecentRegions] = React.useState<any>();
  const [recentResources, setRecentResources] = React.useState<any>();

  const getLocation = (): Promise<UserPosition | undefined> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setScanStatus("Geolocation is not supported by your browser");
        reject();
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserPosition([
              position.coords.latitude,
              position.coords.longitude,
            ]);
            resolve([position.coords.latitude, position.coords.longitude]);
          },
          () => {
            reject();
          },
          {
            enableHighAccuracy: true,
          }
        );
      }
    });
  };

  React.useLayoutEffect(() => {
    (async function gl() {
      await getLocation();
    })();
  }, []);

  const scan = async () => {
    setScanStatus("loading");
    setScanResult(null);
    setInteractableResources([]);
    const userPosition = await getLocation();

    if (!userPosition) {
      setScanStatus("error");
      return;
    }

    console.log("sending:", userPosition);

    try {
      const res = await fetch(`${config.url}/scan`, {
        method: "POST",
        body: JSON.stringify({
          userPosition,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        setScanStatus("error");
        throw new Error(`Error with scan. ${res.status}`);
      }
      const data = await res.json();
      setScanResult(data);
      setScanStatus(null);
      setInteractableResources([...data.interactableResources]);
    } catch (error) {
      console.log(error);
    }

    // await showRecent();
  };

  const toDate = (utc: string) => {
    return new Date(utc).toLocaleString();
  };

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

  return (
    <div className="App">
      <div id="map">
        {userPosition && scanResult ? (
          <Map userPosition={userPosition} resources={scanResult.resources} />
        ) : scanStatus === "loading" ? (
          <Loading />
        ) : (
          "Scan the area to find resources."
        )}
      </div>

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
              console.log(scanResult.resources);
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
