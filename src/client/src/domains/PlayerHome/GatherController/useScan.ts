import { AbcRounded } from "@mui/icons-material";
import * as React from "react";
import { useLogger } from "../../../global/logger/useLogger";
import { useScanMutation } from "../../../global/state/apiSlice";
import {
  refreshWatcher,
  startWatcher,
} from "../../../global/state/geoLocationSlice";
import { useAppDispatch, useAppSelector } from "../../../global/state/store";
import { UserPosition, ScanStatus, APITypes } from "../../../types";

type UseScanReturn = {
  scan: (position?: UserPosition) => void;
  scannedLocation: UserPosition | null;
  scanStatus: ScanStatus;
  scanResult: APITypes.ScanResult | undefined;
};

export const useScan = () => {
  const { logger } = useLogger();
  const dispatch = useAppDispatch();
  const isWatching = useAppSelector((state) => state.geoLocation.isWatching);
  const location = useAppSelector((state) => state.geoLocation.location);
  //
  const scanStartTime = React.useRef<number | null>();
  const [scannedLocation, setScannedLocation] =
    React.useState<UserPosition | null>(null);
  const scanCount = React.useRef<number>(0);
  const [scanStatus, setScanStatus] = React.useState<ScanStatus>(null);
  const scanAnimationTimer = React.useRef<NodeJS.Timeout>();

  const [scanRequest, { data: scanResult }] = useScanMutation();

  const scan = React.useCallback(
    (position?: UserPosition) => {
      scanStartTime.current = new Date().getTime();
      setScanStatus(null);

      let scanPosition: UserPosition;
      // If a position is passed a parameter, use it to scan instead of GPS
      if (!position) {
        if (!isWatching) {
          logger(`useScan - aborted, awaiting GPS location`, "domain");
          setScanStatus("AWAITING_GPS");
          dispatch(startWatcher());
          return;
        }

        if (!location) {
          logger(
            `useScan - Did not have GPS location to scan`,
            "domain",
            "error"
          );
          setScanStatus("ERRORED");
          return;
        }
        scanPosition = [location.coords.latitude, location.coords.longitude];
      } else {
        scanPosition = position;
      }

      setScanStatus("STARTED");

      scanCount.current = scanCount.current + 1;
      setScannedLocation(scanPosition);

      dispatch(refreshWatcher()); // resets the geolocation watcher duration

      // RTK query
      // Perform the scan query then use unwrap() to get the promised result
      scanRequest({ body: { userPosition: scanPosition } })
        .unwrap()
        .then(() => {
          // Calculate remaining animation time
          const elapsedScanTime =
            new Date().getTime() - (scanStartTime.current as number);
          const remainingAnimationTime = 1500 - elapsedScanTime;

          logger(`useScan - scan request success`, "domain", "info");

          scanAnimationTimer.current = setTimeout(
            () => {
              setScanStatus("COMPLETED");
              scanStartTime.current = null;
              logger(`useScan - scan animation complete`, "domain");
            },
            remainingAnimationTime > 0 ? remainingAnimationTime : 0
          );
        })
        .catch((error) => {
          setScanStatus("ERRORED");
          logger(`useScan - RTKQ error: ${error}`, "domain", "error");
        });
    },
    [scanRequest, isWatching, dispatch, location, logger]
  );

  // This watches for new locations while we are in the "awaiting" state
  // E.g. the user clicked scan but no watcher session active, so we waited for a new one to boot up and give us a location
  React.useEffect(() => {
    if (scanStatus === "AWAITING_GPS" && location) {
      logger(`useScan - restarting scan with new GPS location`, "domain");
      scan();
    }
  }, [scanStatus, location, scan, logger]);

  // Clean up
  React.useEffect(() => {
    return () => {
      clearTimeout(scanAnimationTimer.current);
    };
  }, []);

  const result: UseScanReturn = {
    scan,
    scannedLocation,
    scanStatus,
    scanResult,
  };
  return result;
};
