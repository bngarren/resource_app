import * as React from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import styles from "./radarIcon.module.scss";

export const RadarIcon = (scanRadiusPx: number, zoomedIn: boolean) => {
  const radarSize = zoomedIn ? "130vmin" : `${scanRadiusPx * 2}px`;
  const iconHTML = renderToStaticMarkup(
    <div
      className={styles.stage}
      style={{
        width: radarSize,
        height: radarSize,
      }}
    >
      <div className={styles.ping} style={{}} />
    </div>
  );
  return L.divIcon({
    html: iconHTML,
    className: "dummy",
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
