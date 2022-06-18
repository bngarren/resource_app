import * as React from "react";
import config from "./config";
import "./styles/App.css";
import { UserPosition, ScanResult } from "@backend/types";

function App() {
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);

  const getLocation = (): Promise<UserPosition | undefined> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setStatus("Geolocation is not supported by your browser");
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
    setStatus("Loading...");
    setResult(null);
    const userPosition = await getLocation();

    if (!userPosition) {
      setStatus("Error");
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
      setStatus("Error");
    }
    const json: ScanResult = await res.json();
    setResult(json);
    setStatus(null);
  };

  return (
    <div className="App">
      <h1>Resource App</h1>
      <button onClick={scan}>Scan</button>
      <p>{status && status}</p>
      {result && (
        <div>
          <h2>Regions</h2>
          <ul>
            {result.regions.map((r) => {
              return <li key={r.id}>{r.h3Index}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
