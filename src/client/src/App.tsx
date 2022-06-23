import * as React from "react";
import config from "./config";
import "./styles/App.css";

interface UserPosition {
  latitude: number;
  longitude: number;
}

function App() {
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
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            reject();
          }
        );
      }
    });
  };

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

  return (
    <div className="App">
      <h1>Resource App</h1>
      <button onClick={scan}>Scan</button>
      <p>{scanStatus && scanStatus}</p>
      {scanResult && (
        <div>
          <h3>Resources</h3>
          <ul>
            {scanResult.resources.map((r: any) => {
              const shouldBold = r.distanceFromUser <= 100;
              return (
                <li
                  key={r.id}
                  style={{
                    fontWeight: shouldBold ? "bold" : "normal",
                    backgroundColor: r.userCanInteract ? "#C2FF85" : "inherit",
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
