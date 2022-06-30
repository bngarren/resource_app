import * as React from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { CSSProperties } from "@emotion/serialize";

export const UserIcon = (
  color = "blue",
  otherStyle?: Record<string, string>
) => {
  const iconHTML = renderToStaticMarkup(
    <LocationOnIcon
      fontSize="large"
      style={{ fill: color, opacity: 0.75, ...otherStyle }}
    />
  );
  return L.divIcon({
    html: iconHTML,
    className: "dummy",
    iconSize: [45, 45],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  });
};
