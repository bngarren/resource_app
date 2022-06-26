import { TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, UserPosition } from "../../types";
import { Typography } from "@mui/material";

type MapProps = {
  position?: UserPosition;
  resources?: Resource[];
};

const Map = ({ position, resources }: MapProps) => {
  if (position) {
    return (
      <MapContainer
        center={position}
        zoomControl={false}
        zoom={!position ? 2 : 17}
        scrollWheelZoom={false}
      >
        <ZoomControl position={"bottomleft"} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <>
            <Marker position={position}>
              <Popup>You are here.</Popup>
            </Marker>
            {resources && (
              <Circle center={position} radius={SCAN_DISTANCE_METERS} />
            )}
          </>
        )}

        {resources &&
          resources.map((r) => {
            return (
              <Polygon
                positions={r.vertices}
                pathOptions={{
                  color: r.userCanInteract ? "#2AFB09" : "purple",
                }}
                key={r.id}
              >
                <Popup>
                  {`${r.name} ${Math.round(r.distanceFromUser)}m`}
                  <br />
                  {`${r.h3Index}`}
                </Popup>
              </Polygon>
            );
          })}
      </MapContainer>
    );
  } else {
    return (
      <>
        <Typography>Booting up scanner...</Typography>
      </>
    );
  }
};

export default Map;
