import * as React from "react";
import {
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  useMap,
} from "react-leaflet";
import { userIcon } from "./userIcon";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, UserPosition } from "../../types";
import {
  Backdrop,
  Box,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { LatLng, LatLngExpression, LatLngTuple } from "leaflet";

const DEFAULT_MAP_CENTER = [42.3600825, -71.0588801] as LatLngTuple;

const MapPlaceHolder = () => {
  return <>MAP PLACEHOLDER</>;
};

const LoadingOverlay = () => {
  return (
    <Stack direction="column" sx={{ width: "80%" }}>
      <Typography variant="caption" sx={{ color: "white" }}>
        Acquiring GPS position...
      </Typography>
      <LinearProgress
        sx={{
          backgroundColor: "#D7F363",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "white",
          },
        }}
      />
    </Stack>
  );
};

type FlyToPositionProps = {
  position: LatLngExpression;
  animateRef: React.MutableRefObject<boolean>;
  animateDuration?: number;
  zoomLevel?: number;
};
const FlyToPosition = ({
  position,
  animateRef,
  animateDuration,
  zoomLevel = 17,
}: FlyToPositionProps) => {
  const map = useMap();

  map.setView(position, zoomLevel, {
    animate: animateRef.current != null || false,
    duration: animateDuration || 1,
  });
  return null;
};

type MapWrapperProps = {
  initLocation?: LatLngTuple;
  userPosition?: UserPosition;
  resources?: Resource[];
};

const MapWrapper = ({
  initLocation,
  userPosition,
  resources,
}: MapWrapperProps) => {
  const [mapCenter, setMapCenter] = React.useState<LatLngTuple>();
  const preScanUserPosition = React.useRef<LatLngTuple>();
  const animateRef = React.useRef(userPosition == null);

  if (initLocation) {
    if (mapCenter == null) {
      console.log("set map center");
      setMapCenter(initLocation);
    }
    if (!preScanUserPosition.current) {
      preScanUserPosition.current = initLocation;
    }
  }

  return (
    <Box
      id="map"
      sx={{
        position: "relative",
      }}
    >
      <Backdrop
        open={mapCenter == null}
        sx={{
          position: "absolute",
          zIndex: 10000,
          opacity: 0.2,
        }}
      >
        <LoadingOverlay />
      </Backdrop>

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
        {mapCenter && !userPosition && (
          <FlyToPosition
            position={mapCenter}
            animateRef={animateRef}
            animateDuration={3}
            zoomLevel={14}
          />
        )}
        {userPosition && (
          <FlyToPosition
            position={userPosition}
            animateRef={animateRef}
            animateDuration={4}
          />
        )}

        {preScanUserPosition.current != null && !userPosition && (
          <>
            <Marker position={preScanUserPosition.current}>
              <Popup>You are somewhere near here.</Popup>
            </Marker>
            <Circle center={preScanUserPosition.current} radius={100} />
          </>
        )}

        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon("green", {})}>
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
    </Box>
  );
};

export default MapWrapper;
