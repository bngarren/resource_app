import * as React from "react";
import config from "./config";
import "./styles/App.css";
import { UserPosition } from "@backend/types";

function App() {
  const [result, setResult] = React.useState();
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
    const json = await res.json();
    setResult(json);
    setStatus(null);
  };

  return (
    <div className="App">
      <h1>Resource App</h1>
      <button onClick={scan}>Scan</button>
      <p>{status && status}</p>
      <pre>
        <code>{result && JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}

export default App;
