import * as React from "react";
import MapWrapper from "../../components/MapWrapper";
import config from "../../config";
import { UserPosition } from "../../types";
import { h3ToGeo } from "h3-js";
import { MapContainer } from "react-leaflet";

const Dashboard = () => {
  const [position, setPosition] = React.useState<UserPosition>();
  const [positionInput, setPositionInput] = React.useState("");
  const [scanResult, setScanResult] = React.useState<any>();
  const [scanStatus, setScanStatus] = React.useState<string | null>(null);

  const scan = async (userPosition: [number, number]) => {
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewPosition = async () => {
    const coords = h3ToGeo(positionInput) as [number, number];
    setPosition(coords);
    await scan(coords);
  };

  return (
    <>
      <div
        id="mapContainer"
        style={{ width: "100%", height: "400px", marginBottom: "1rem" }}
      ></div>
      <div style={{ padding: "0 2rem" }}>
        h3 index:
        <input
          type="text"
          value={positionInput}
          onChange={(e) => setPositionInput(e.target.value)}
          style={{
            border: "1px solid black",
            margin: "0 1rem",
            padding: "0.2rem",
          }}
        />
        <button onClick={handleNewPosition}>Scan</button>
      </div>
    </>
  );
};

export default Dashboard;
