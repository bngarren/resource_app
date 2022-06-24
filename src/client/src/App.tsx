import * as React from "react";
import config from "./config";
import "./styles/App.css";
import Map from "./components/Map";
import { UserPosition } from "./types";
import { Link } from "react-router-dom";

const Loading = () => {
  return <>Scanning...</>;
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

  const showRecent = async () => {
    setRecentRegions(null);
    setRecentResources(null);
    const res = await fetch(`${config.url}/debug`);
    if (!res.ok) return;
    const json = await res.json();
    setRecentRegions(json.regions);
    setRecentResources(json.resources);
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
        <button onClick={scan}>Scan</button>
      </div>

      <div id="actions">
        <ul>
          {scanResult &&
            interactableResources.map((r) => {
              console.log(scanResult.resources);
              const resource = scanResult?.resources?.find(
                (f: any) => f.id === r
              );

              if (resource != null)
                return (
                  <li key={resource.id}>
                    You have found {resource.name}! <button>Harvest</button>
                  </li>
                );
            })}
        </ul>
      </div>

      {scanResult && (
        <div>
          <h3>Resources</h3>
          <ul>
            {scanResult.resources
              ?.sort((a: any, b: any) => {
                return a.distanceFromUser - b.distanceFromUser;
              })
              .map((r: any) => {
                const shouldBold = r.distanceFromUser <= 100;
                return (
                  <li
                    key={r.id}
                    style={{
                      fontWeight: shouldBold ? "bold" : "normal",
                      backgroundColor: r.userCanInteract
                        ? "#2AFB09"
                        : getDistanceColor(r.distanceFromUser),
                    }}
                  >
                    {r.id} - {r.name} - {Math.round(r.distanceFromUser)}m away
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      <div
        style={{
          marginTop: "4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "10px",
        }}
      >
        <button onClick={showRecent}>Update Recent</button>
        {recentRegions && (
          <div style={{ width: "600px" }}>
            <table style={{ width: "100%" }}>
              <thead
                style={{
                  backgroundColor: "darkblue",
                  color: "white",
                  fontSize: "15px",
                }}
              >
                <tr>
                  <th colSpan={5}>Recent Regions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontWeight: "bold", fontSize: "12px" }}>
                  <th
                    scope="col"
                    style={{ fontWeight: "bold", backgroundColor: "lightblue" }}
                  >
                    id
                  </th>
                  <th scope="col">h3Index</th>
                  <th scope="col">created_at</th>
                  <th
                    scope="col"
                    style={{ fontWeight: "bold", backgroundColor: "yellow" }}
                  >
                    updated_at
                  </th>
                  <th scope="col">reset_date</th>
                </tr>
                {recentRegions.map((r: any) => {
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.h3Index}</td>
                      <td>{toDate(r.created_at)}</td>
                      <td>{toDate(r.updated_at)}</td>
                      <td>{toDate(r.reset_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {recentResources && (
          <div style={{ width: "600px" }}>
            <table style={{ width: "100%" }}>
              <thead
                style={{
                  backgroundColor: "darkblue",
                  color: "white",
                  fontSize: "15px",
                }}
              >
                <tr>
                  <th colSpan={5}>Recent Resources</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ fontWeight: "bold", fontSize: "12px" }}>
                  <th scope="col">id</th>
                  <th scope="col">name</th>
                  <th
                    scope="col"
                    style={{ fontWeight: "bold", backgroundColor: "lightblue" }}
                  >
                    region_id
                  </th>
                  <th scope="col">h3Index</th>
                </tr>
                {recentResources.map((r: any) => {
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.name}</td>
                      <td>{r.region_id}</td>
                      <td>{r.h3Index}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
