import { TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, UserPosition } from "../../types";
import { Typography } from "@mui/material";

type MapProps = {
  userPosition?: UserPosition;
  resources?: Resource[];
};

const Map = ({ userPosition, resources }: MapProps) => {
  if (userPosition) {
    return (
      <MapContainer
        center={userPosition}
        zoomControl={false}
        zoom={!userPosition ? 2 : 17}
        scrollWheelZoom={false}
      >
        <ZoomControl position={"bottomleft"} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && (
          <>
            <Marker position={userPosition}>
              <Popup>You are here.</Popup>
            </Marker>
            <Circle
              center={userPosition}
              radius={SCAN_DISTANCE_METERS}
            ></Circle>
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
