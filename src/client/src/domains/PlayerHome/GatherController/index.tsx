import {
  Alert,
  AlertColor,
  Box,
  Button,
  Container,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import * as React from "react";
import MapWrapper from "../../../components/MapWrapper";
import { useAppSelector, useAppDispatch } from "../../../global/state/store";
import { startWatcher } from "../../../global/state/geoLocationSlice";
import { geoCoordinatesToLatLngTuple, getInteractables } from "../../../util";
import { useScan } from "./useScan";
import { InteractionModal } from "./InteractionModal";
import config from "../../../config";
import { h3ToGeo } from "h3-js";
import { AnyInteractable, APITypes } from "../../../types";
import InteractablesDisplay from "./InteractablesDisplay";

const isDebug = config.debugMode === true;

/**
 * ### GatherController
 * ---
 * This component is a wrapper component for UI that deals with the user's interactions with the real world.
 * It manages starting a GPS watcher and coordinating user actions such as scan, harvest,
 * use equipment, etc.
 *
 */
const GatherController = () => {
  const dispatch = useAppDispatch();
  const isWatching = useAppSelector((state) => state.geoLocation.isWatching);
  const geoError = useAppSelector((state) => state.geoLocation.error);

  const geoDeniedError = geoError.find(
    (e) => e.code === GeolocationPositionError.PERMISSION_DENIED
  );

  // Get the initial GPS location to initialize the MapWrapper
  const initialLocation = useAppSelector((state) =>
    state.geoLocation.initialLocation
      ? geoCoordinatesToLatLngTuple(state.geoLocation.initialLocation.coords)
      : undefined
  );

  // This component will initialize a watcher session on mount if
  // one isn't already running
  const hasInitiatedWatcher = React.useRef(false);

  // The user scan operation
  const { scan, scannedLocation, scanStatus, scanResult } = useScan();

  let interactables: Partial<APITypes.ScanResult["interactables"]> = {};
  if (scanResult) {
    interactables = getInteractables(scanResult);
    console.log(interactables);
  }

  // InteractionModal
  const [modalOpen, setModalOpen] = React.useState(false);

  const [selectedInteractable, setSelectedInteractable] =
    React.useState<AnyInteractable | null>(null);

  // DEBUG mode
  // Allows scanning from a given h3 Index
  const [h3Input, setH3Input] = React.useState("");

  const handleCloseModal = React.useCallback(
    (reason?: "backdropClick" | "escapeKeyDown") => {
      setModalOpen(false);
      setSelectedInteractable(null);
    },
    []
  );

  React.useEffect(() => {
    if (!hasInitiatedWatcher.current) {
      dispatch(startWatcher);
      hasInitiatedWatcher.current = true;
    }
  }, [dispatch]);

  const handleScan = React.useCallback(async () => {
    if (isDebug && h3Input) {
      const coords = h3ToGeo(h3Input) as [number, number];
      scan(coords);
    } else {
      scan();
    }
  }, [scan, h3Input]);

  /**
   * This callback will handle the selection of an interactable that the user can interact with and display the interaction modal.
   * For example, this callback is passed to InteractablesDisplay to be fired when an interactable is clicked on
   */
  const handleSelectInteractable = React.useCallback(
    (category: APITypes.Interactable["category"], id: number) => {
      const selected = interactables[
        category as keyof APITypes.ScanResult["interactables"]
      ]?.find((i) => i.id === id);
      if (selected) {
        setSelectedInteractable(selected as AnyInteractable);
        setModalOpen(true);
      }
    },
    [interactables]
  );

  const alertSeverity = {
    COMPLETED: "success",
    AWAITING_GPS: "info",
    STARTED: "info",
    ERRORED: "error",
  };

  return (
    <>
      <MapWrapper
        initialLocation={initialLocation}
        userPosition={scannedLocation}
        scanStatus={scanStatus}
        message={
          geoDeniedError && {
            content: "GPS location denied. Please change browser settings.",
            type: "error",
          }
        }
        resources={scanResult?.interactables.resources}
      />
      <Box>
        {isDebug && scanStatus && (
          <Alert severity={alertSeverity[scanStatus] as AlertColor}>
            {scanStatus}
          </Alert>
        )}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          {isDebug && (
            <TextField
              value={h3Input}
              onChange={(e) => setH3Input(e.target.value)}
              size="small"
              placeholder="h3 Index"
            />
          )}
          <Button
            onClick={handleScan}
            size="large"
            variant="contained"
            disabled={scanStatus === "STARTED" || scanStatus === "AWAITING_GPS"}
          >
            Scan
          </Button>
        </Stack>
        {scanStatus === "COMPLETED" && (
          <Container>
            <InteractablesDisplay
              interactables={interactables}
              onSelect={handleSelectInteractable}
            />
          </Container>
        )}
        <InteractionModal
          open={modalOpen}
          handleClose={handleCloseModal}
          interactable={selectedInteractable}
        />
      </Box>
    </>
  );
};

export default GatherController;

/* function getDistanceColor(dist: number) {
  if (dist > 500) {
    return "#FFC285";
  } else if (dist > 400) {
    return "#FFE085";
  } else if (dist > 300) {
    return "#FBFF85";
  } else if (dist > 200) {
    return "#E7FF85";
  } else if (dist > 100) {
    return "#D4FF85";
  } else if (dist > 75) {
    return "#C9FF85";
  } else if (dist <= 75) {
    return "#B5FF85";
  }
} */
