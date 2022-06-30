import * as React from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { CSSProperties } from "@emotion/serialize";
import { Box } from "@mui/material";

export const RadarIcon = (scanRadiusPx: number) => {
  const size = scanRadiusPx * 1;
  const sizePx = `${size}px`;
  console.log(sizePx);
  const iconHTML = renderToStaticMarkup(
    <Box
      style={{
        position: "absolute",
        boxSizing: "border-box",
        top: `-${size - 8}px`,
        left: `-${size - 5}px`,
        borderRight: "solid 1px hsla(145, 50%, 40%, .3)",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "100% 0 0 0",
        transformOrigin: "100% 100%",
        background:
          "linear-gradient(50deg, rgba(34, 34, 34, 0) 56%, hsla(145, 50%, 40%, 1))",
        animation: "sweep 1.5s infinite linear",
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
