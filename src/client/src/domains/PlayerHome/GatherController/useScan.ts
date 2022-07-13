import * as React from "react";
import { useScanMutation } from "../../../global/state/apiSlice";
import {
  refreshWatcher,
  startWatcher,
} from "../../../global/state/geoLocationSlice";
import { useAppDispatch, useAppSelector } from "../../../global/state/store";
import { UserPosition, ScanStatus, APITypes } from "../../../types";

type UseScanReturn = {
  scan: () => void;
  scannedLocation: UserPosition | null;
  scanStatus: ScanStatus;
  scanResult: APITypes.ScanResult | undefined;
};

export const useScan = () => {
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

  const scan = React.useCallback(() => {
    scanStartTime.current = new Date().getTime();
    setScanStatus(null);

    if (!isWatching) {
      console.log("Scan aborted, awaiting GPS location.");
      setScanStatus("AWAITING_GPS");
      dispatch(startWatcher());
      return;
    }

    if (!location) {
      console.error("Did not have GPS location to scan");
      setScanStatus("ERRORED");
      return;
    }

    setScanStatus("STARTED");

    const userPosition: UserPosition = [
      location.coords.latitude,
      location.coords.longitude,
    ];

    scanCount.current = scanCount.current + 1;
    setScannedLocation(userPosition);

    dispatch(refreshWatcher()); // resets the geolocation watcher duration

    // RTK query
    // Perform the scan query then use unwrap() to get the promised result
    scanRequest({ body: { userPosition } })
      .unwrap()
      .then(() => {
        // Calculate remaining animation time
        const elapsedScanTime =
          new Date().getTime() - (scanStartTime.current as number);
        const remainingAnimationTime = 1500 - elapsedScanTime;

        scanAnimationTimer.current = setTimeout(
          () => {
            setScanStatus("COMPLETED");
            scanStartTime.current = null;
            console.log("Scan completed.");
          },
          remainingAnimationTime > 0 ? remainingAnimationTime : 0
        );
      })
      .catch((error) => {
        setScanStatus("ERRORED");
        console.error(error);
      });
  }, [scanRequest, isWatching, dispatch, location]);

  // This watches for new locations while we are in the "awaiting" state
  // E.g. the user clicked scan but no watcher session active, so we waited for a new one to boot up and give us a location
  React.useEffect(() => {
    if (scanStatus === "AWAITING_GPS" && location) {
      console.log("Restarting scan with new location");
      scan();
    }
  }, [scanStatus, location, scan]);

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
