import { TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, UserPosition } from "../../types";

type MapProps = {
  userPosition: UserPosition;
  resources: Resource[];
};

const Map = ({ userPosition, resources }: MapProps) => {
  return (
    <MapContainer
      center={userPosition}
      zoomControl={false}
      zoom={17}
      scrollWheelZoom={false}
    >
      <ZoomControl position={"topright"} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={userPosition}>
        <Popup>You are here.</Popup>
      </Marker>
      <Circle center={userPosition} radius={SCAN_DISTANCE_METERS}></Circle>
      {resources.map((r) => {
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
};

export default Map;
