import * as React from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { CSSProperties } from "@emotion/serialize";
import { Box } from "@mui/material";

export const RadarIcon = (
  scanRadiusPx: number,
  zoomedIn: boolean,
  zoomLevel: number
) => {
  const scale = (scanRadiusPx * 10) / (zoomLevel ** 5 * 2);
  const size = zoomedIn ? scale * 100000 : scanRadiusPx;
  const outline = zoomedIn ? 1 / (scale * 25) : 15;
  console.log("scale", scale);
  console.log("size", size);
  console.log("outline", outline);

  const iconHTML = renderToStaticMarkup(
    <Box
      style={{
        position: "absolute",
        top: `${-size + 5}px`,
        left: `${-size + 5}px`,
        alignSelf: "center",
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        outline: `${outline}px solid blue`,
        borderRadius: "50%",
        transform: "scale(0)",
        animation: `pulse ${1.5}s linear 0s`,
        boxShadow: "0 0 10px white",
      }}
    />
  );
  return L.divIcon({
    html: iconHTML,
    className: "radar",
    iconSize: [10, 10],
    iconAnchor: [5, 10],
    popupAnchor: [0, -40],
  });
};

/* sx={{
   position: "absolute",
   boxSizing: "border-box",
   top: "-103px; left: -103px",
   borderRight: "solid 1px hsla(145, 50%, 40%, .3)",
   width: "108px; height: 108px",
   borderRadius: "100% 0 0 0",
   transformOrigin: "100% 100%",
   background:
     "linear-gradient(50deg, rgba(34, 34, 34, 0) 56%, hsla(145, 50%, 40%, 1))",
   animation: "sweep 1.5s infinite linear",
 }} */
