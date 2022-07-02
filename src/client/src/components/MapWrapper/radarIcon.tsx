import L, { Point } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "./radarIcon.module.scss";

export const RadarIcon = (
  scanRadiusPx: number,
  zoomedIn: boolean,
  mapSize: Point
) => {
  const radarSize = zoomedIn
    ? Math.max(mapSize.x, mapSize.y) * 1.5
    : `${scanRadiusPx * 2}px`;
  const iconHTML = renderToStaticMarkup(
    <div
      className={styles.stage}
      style={{
        width: radarSize,
        height: radarSize,
      }}
    >
      <div className={`${styles.ping} ${styles.small}`} style={{}} />
      <div className={`${styles.ping} ${styles.big}`} style={{}} />
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
