import * as React from "react";
import {
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  useMap,
  LayerGroup,
} from "react-leaflet";
import { UserIcon } from "./userIcon";
import { RadarIcon } from "./radarIcon";
import { MapContainer, ZoomControl } from "react-leaflet";
import { SCAN_DISTANCE_METERS } from "@backend/constants";
import { Resource, ScanStatus, UserPosition } from "../../types";
import {
  Backdrop,
  Box,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import L, { LatLngExpression, LatLngTuple } from "leaflet";
import GeometryUtil from "leaflet-geometryutil";

// TODO Consider using an early location based on IP address to set this prior to GPS location being available
/**
 * Lat/Lng coordinates used to center the map before any user location data is available. Currently, these are set to Boston, MA
 *
 */
const DEFAULT_MAP_CENTER = [42.3600825, -71.0588801] as LatLngTuple;

const MapPlaceHolder = () => {
  return <>MAP PLACEHOLDER</>;
};

/**
 * Used for the content of our Backdrop that displays over the Map
 * @returns JSX.Element
 */
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

type ChangeViewProps = {
  position: LatLngExpression;
  shouldAnimate?: boolean;
  animateDuration?: number;
  zoomLevel?: number;
  type?: "fly" | "pan" | "set";
};
const ChangeView = ({
  position,
  shouldAnimate = true,
  animateDuration,
  zoomLevel = 17,
  type = "set",
}: ChangeViewProps) => {
  const map = useMap();

  switch (type) {
    case "fly":
      map.flyTo(position, zoomLevel, {
        animate: shouldAnimate,
        duration: animateDuration || 1,
      });
      break;
    case "pan":
      map.panTo(position, {
        animate: shouldAnimate,
        duration: animateDuration || 1,
      });
      break;
    case "set":
      map.setView(position, zoomLevel, {
        animate: shouldAnimate,
        duration: animateDuration || 1,
      });
      break;
  }

  return null;
};

type MapInitializationProps = {
  position: LatLngExpression;
};

/**
 *
 * This component renders a leaflet element that will flyto and animate a new map center upon initial render, after that it will do nothing.
 *
 * This sets the position and zoom of the map when we have a user location but prior to any scanning
 *
 * @returns JSX.Element
 */
const MapInitialization = ({ position }: MapInitializationProps) => {
  const hasInitialized = React.useRef(false);
  if (!hasInitialized.current) {
    hasInitialized.current = true;
    return (
      <ChangeView
        position={position}
        animateDuration={1.5}
        zoomLevel={15}
        type="fly"
      />
    );
  } else return <></>;
};

type UserMarkerProps = {
  position: LatLngExpression | null;
  isScanning: boolean;
  showRadar: boolean;
};

/**
 *
 * This component renders a leaflet element that displays the User marker
 *
 * @returns JSX.Element
 */
const UserMarker = ({
  position,
  isScanning,
  showRadar = false,
}: UserMarkerProps) => {
  const map = useMap();
  if (position != null) {
    // Calculate the scan radius in pixels
    const l2 = GeometryUtil.destination(
      map.getCenter(),
      90,
      SCAN_DISTANCE_METERS
    );
    const p1 = map.latLngToContainerPoint(map.getCenter());
    const p2 = map.latLngToContainerPoint(l2);
    const res = p1.distanceTo(p2);

    const color = isScanning ? "green" : "blue";

    return (
      <>
        {showRadar && (
          <>
            <Marker
              position={position}
              icon={RadarIcon(res)}
              bubblingMouseEvents={true}
            />
            <Circle
              center={position}
              radius={SCAN_DISTANCE_METERS}
              pathOptions={{
                opacity: 0.3,
                fill: false,
                color: "green",
              }}
            />
          </>
        )}
        <Marker position={position} icon={UserIcon(color, {})}>
          <Popup>You are here.</Popup>
        </Marker>
      </>
    );
  } else return <></>;
};

type ScanAreaProps = {
  position: LatLngExpression | null;
};

/**
 *
 * This component renders a leaflet element that displays the scanned area
 *
 * @returns JSX.Element
 */
const ScanArea = ({ position }: ScanAreaProps) => {
  const map = useMap();
  if (position != null) {
    return (
      <>
        <Circle
          center={position}
          radius={SCAN_DISTANCE_METERS}
          pathOptions={{
            opacity: 0.6,
            fillOpacity: 0.1,
          }}
        />
      </>
    );
  } else return <></>;
};

type MapWrapperProps = {
  initLocation?: LatLngTuple;
  userPosition?: UserPosition;
  scanStatus?: ScanStatus;
  resources?: Resource[];
};

const MapWrapper = ({
  initLocation,
  userPosition,
  scanStatus,
  resources,
}: MapWrapperProps) => {
  const [mapCenter, setMapCenter] = React.useState<LatLngTuple>();
  const preScanUserPosition = React.useRef<LatLngTuple>();

  if (initLocation) {
    if (mapCenter == null) {
      console.log("set map center");
      setMapCenter(initLocation);
    }
    if (!preScanUserPosition.current) {
      preScanUserPosition.current = initLocation;
    }
  }

  const isScanning = scanStatus === "scanning" || scanStatus === "awaiting";

  return (
    <Box
      id="map"
      sx={{
        position: "relative",
      }}
    >
      <Backdrop
        open={mapCenter == null || scanStatus === "awaiting"}
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
        {!isScanning && <ZoomControl position={"bottomleft"} />}

        {mapCenter && !userPosition && (
          <MapInitialization position={mapCenter} />
        )}

        <UserMarker
          position={userPosition || mapCenter || null}
          isScanning={isScanning}
          showRadar={scanStatus === "scanning"}
        />

        {scanStatus === "complete" && (
          <LayerGroup>
            <ScanArea position={userPosition || null} />

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
          </LayerGroup>
        )}
      </MapContainer>
    </Box>
  );
};

export default MapWrapper;
