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
import { LatLng, LatLngExpression, LatLngTuple } from "leaflet";

const DEFAULT_MAP_CENTER = [42.3600825, -71.0588801] as LatLngTuple;

const MapPlaceHolder = () => {
  return <>MAP PLACEHOLDER</>;
};

type FlyToPositionProps = {
  position: LatLngExpression;
  animateRef: React.MutableRefObject<boolean>;
  animateDuration?: number;
};
const FlyToPosition = ({
  position,
  animateRef,
  animateDuration,
}: FlyToPositionProps) => {
  const map = useMap();

  map.setView(position, 17, {
    animate: animateRef.current != null || false,
    duration: animateDuration || 1,
  });
  return null;
};

type MapWrapperProps = {
  location?: UserPosition;
  userPosition?: UserPosition;
  resources?: Resource[];
};

const MapWrapper = ({ location, userPosition, resources }: MapWrapperProps) => {
  const [mapCenter, setMapCenter] = React.useState<LatLngTuple>();
  const preScanUserPosition = React.useRef<LatLngTuple>();
  const animateRef = React.useRef(userPosition == null);

  React.useEffect(() => {
    if (location) {
      if (mapCenter == null) {
        console.log("set map center");
        setMapCenter(location);
      }
      if (!preScanUserPosition.current) {
        preScanUserPosition.current = location;
      }
    }
  }, [location, mapCenter]);

  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
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
      {mapCenter && (
        <FlyToPosition
          position={mapCenter}
          animateRef={animateRef}
          animateDuration={3}
        />
      )}

      {preScanUserPosition.current != null && (
        <Marker position={userPosition || preScanUserPosition.current}>
          <Popup>You are here.</Popup>
        </Marker>
      )}

      {userPosition && (
        <>
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
