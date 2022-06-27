import * as React from "react";
import {
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  useMap,
} from "react-leaflet";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, UserPosition } from "../../types";
import { Typography } from "@mui/material";
import { LatLng, LatLngExpression } from "leaflet";

const BOSTON = new LatLng(42.3600825, -71.0588801);

const MapPlaceHolder = () => {
  return <>MAP PLACEHOLDER</>;
};

type PanToViewOnUserPositionProps = {
  userPosition: LatLngExpression;
  animateRef: React.MutableRefObject<boolean>;
};
const PanToViewOnUserPosition = ({
  userPosition,
  animateRef,
}: PanToViewOnUserPositionProps) => {
  const map = useMap();
  map.flyTo(userPosition, 17, {
    animate: animateRef.current != null || false,
    duration: 1,
  });
  return null;
};

type MapWrapperProps = {
  mapCenter?: LatLngExpression;
  userPosition?: LatLngExpression;
  resources?: Resource[];
};

const MapWrapper = ({
  mapCenter = BOSTON,
  userPosition,
  resources,
}: MapWrapperProps) => {
  const animateRef = React.useRef(userPosition == null);
  return (
    <MapContainer
      center={mapCenter}
      zoomControl={false}
      zoom={2}
      scrollWheelZoom={false}
      placeholder={<MapPlaceHolder />}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position={"bottomleft"} />
      {userPosition && (
        <PanToViewOnUserPosition
          userPosition={userPosition}
          animateRef={animateRef}
        />
      )}

      {userPosition && (
        <>
          <Marker position={userPosition}>
            <Popup>You are here.</Popup>
          </Marker>
          {resources && (
            <Circle center={userPosition} radius={SCAN_DISTANCE_METERS} />
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
};

export default MapWrapper;
