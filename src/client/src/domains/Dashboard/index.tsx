import * as React from "react";
import MapWrapper from "../../components/MapWrapper";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import config from "../../config";
import { UserPosition } from "../../types";
import { h3ToGeo } from "h3-js";
import { useAppDispatch, useAppSelector } from "../../global/state/store";
import { geoCoordinatesToLatLngTuple } from "../../util";
import { useScan } from "../PlayerHome/GatherController/useScan";
import { startWatcher } from "../../global/state/geoLocationSlice";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const isWatching = useAppSelector((state) => state.geoLocation.isWatching);

  // Get the initial GPS location to initialize the MapWrapper
  const initialLocation = useAppSelector((state) =>
    state.geoLocation.initialLocation
      ? geoCoordinatesToLatLngTuple(state.geoLocation.initialLocation.coords)
      : undefined
  );

  // This component will initialize a watcher session on mount if
  // one isn't already running
  const hasInitiatedWatcher = React.useRef(false);

  // The user scan operation
  const { scan, scannedLocation, scanStatus, scanResult } = useScan();

  const [positionInput, setPositionInput] = React.useState("");

  React.useEffect(() => {
    if (!hasInitiatedWatcher.current) {
      dispatch(startWatcher);
      hasInitiatedWatcher.current = true;
    }
  }, [dispatch]);

  const handleScan = async () => {
    if (positionInput) {
      const coords = h3ToGeo(positionInput) as [number, number];
      scan(coords);
    } else {
      scan();
    }
  };

  return (
    <>
      <div
        id="mapContainer"
        style={{ width: "100%", height: "400px", marginBottom: "1rem" }}
      >
        <MapWrapper
          initialLocation={initialLocation}
          userPosition={scannedLocation}
          scanStatus={scanStatus}
          resources={scanResult?.interactables.scannedResources}
        />
      </div>
      {isWatching ? (
        <GpsFixedIcon sx={{ color: "darkgreen" }} />
      ) : (
        <GpsOffIcon />
      )}
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
        <button onClick={handleScan}>Scan</button>
      </div>
    </>
  );
};

export default Dashboard;
