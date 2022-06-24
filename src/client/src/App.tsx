import * as React from "react";
import config from "./config";
import "./styles/App.css";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  Circle,
  Polygon,
} from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";

interface UserPosition {
  latitude: number;
  longitude: number;
}

function App() {
  const [userPosition, setUserPosition] = React.useState<[number, number]>();
  const [scanResult, setScanResult] = React.useState<any>();
  const [scanStatus, setScanStatus] = React.useState<string | null>(null);
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
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
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
    setScanStatus("Loading...");
    setScanResult(null);
    const userPosition = await getLocation();

    if (!userPosition) {
      setScanStatus("Error");
      return;
    }

    console.log("sending:", userPosition);

    const res = await fetch(`${config.url}/scan`, {
      method: "POST",
      body: JSON.stringify({
        userPosition: {
          ...userPosition,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      setScanStatus("Error");
    }
    const json = await res.json();
    setScanResult(json);
    setScanStatus(null);
    await showRecent();
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
      <h1>Resource App</h1>
      <button onClick={scan}>Scan</button>
      <p>{scanStatus && scanStatus}</p>

      {userPosition && scanResult && (
        <MapContainer center={userPosition} zoom={16} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userPosition}>
            <Popup>You are here.</Popup>
          </Marker>
          <Circle center={userPosition} radius={SCAN_DISTANCE_METERS}></Circle>
          {scanResult &&
            scanResult.resources.map((r: any) => {
              return (
                <Polygon
                  positions={r.vertices}
                  pathOptions={{ color: "purple" }}
                  key={r.id}
                >
                  <Popup>{r.name}</Popup>
                </Polygon>
              );
            })}
        </MapContainer>
      )}

      {scanResult && (
        <div>
          <h3>Resources</h3>
          <ul>
            {scanResult.resources
              .sort((a: any, b: any) => {
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
                        ? "#C2FF85"
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
